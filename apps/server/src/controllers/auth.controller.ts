import config from '@/config/config';
import { UserRepository } from '@/repositories/user.repository';
import { IAuthenticatedRequest } from '@/interface/middleware';
import catchAsync from '@/utils/catchAsync';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '@/utils/jwt';
import logger from '@/utils/logger';
import EmailService from '@/utils/sendEmail';
import { SigninSchema, verifySigninSchema } from '@/validations/auth.validation';
import { Request } from 'express';
import z from 'zod';

/**
 * Handles user sign-in by creating a new user if they don't exist and sending a magic link.
 * @param req - The HTTP request object containing the user's email.
 * @param res - The HTTP response object.
 * @returns A success message.
 */
export const signinController = catchAsync(
  async (req: Request<{}, {}, z.infer<typeof SigninSchema>>, res) => {
    const { email } = req.body;
    let user;
    const existinguser = await UserRepository.findbyEmail(email);

    if (existinguser) {
      user = existinguser;
    } else {
      user = await UserRepository.create(email);
    }

    logger.info('Creating token in signinController ...')
    const token = await UserRepository.createToken(user.id);
    logger.info(`${config.CLIENT_URL}?token=${token}`);
    const emailData = {
      id: 4,
      subject: 'Sign in to your account',
      recipient: email,
      body: {
        email,
        magicLink: `${config.CLIENT_URL}?token=${token}`,
      },
    };
    if (config.NODE_ENV !== 'development') {
      await EmailService.send(emailData);
    } else {
      logger.info('Email notification:', emailData);
    }

    return res.status(200).json({ message: 'success' });
  }
);

/**
 * Verifies the magic link token and generates access and refresh tokens for the user.
 * @param req - The HTTP request object containing the magic link token.
 * @param res - The HTTP response object.
 * @returns The user's access and refresh tokens along with their profile completion status.
 */
export const verifySigninController = catchAsync(
  async (req: Request<{}, {}, z.infer<typeof verifySigninSchema>>, res) => {
    const { token } = req.body;
    const decodedToken = verifyAccessToken(token);
    if (!decodedToken) return res.status(401).json({ message: 'Token expired or invalid' });

    logger.info('Verifying token in verifySigninController ...')
    const user = await UserRepository.verifyToken(decodedToken.tokenId);
    if (!user) return res.status(401).json({ message: 'Token expired or invalid' });

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });
    await UserRepository.updateRefreshToken(user.id, refreshToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    const { isCompleted } = user;
    return res.status(200).json({ data: { user: { isCompleted } } });
  }
);

/**
 * Logs out the user by clearing their access and refresh tokens.
 * @param req - The HTTP request object containing the user's ID.
 * @param res - The HTTP response object.
 * @returns A 204 No Content response.
 */
export const logoutController = catchAsync(async (req, res) => {
  const { userId } = req.body;

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  await UserRepository.updateRefreshToken(userId, null);

  return res.status(204).send();
});

/**
 * Retrieves the authenticated user's profile.
 * @param req - The HTTP request object containing the user's ID from the authentication middleware.
 * @param res - The HTTP response object.
 * @returns The user's profile data.
 */
export const getMyDataController = catchAsync(async (req: IAuthenticatedRequest, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

  logger.info('Getting user information in getMyDataController ...')
  const user = await UserRepository.findById(userId.toString());
  if (!user) return res.status(401).json({ message: 'Invalid or expired token' });
  const { magicToken, refreshToken, ...safeUser } = user;

  return res.status(200).json({ message: 'success', data: safeUser });
});
