import config from '@/config/config';
import { IAuthenticatedRequest } from '@/interface/middleware';
import { UserRepository } from '@/repositories/user.repository';
import { TokenExpiredError } from '@/utils/apiError';
import { ForbiddenResponse, SuccessMsgResponse, SuccessResponse } from '@/utils/apiResponse';
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
    const existingUser = await UserRepository.findbyEmail(email, null);
    if (existingUser && existingUser.isDeleted) {
      return new ForbiddenResponse(
        "Your account has been deactivated. Please contact admin to restore your account."
      ).send(res);
    }

    let user;
    if (existingUser) {
      user = existingUser;
    } else {
      user = await UserRepository.create(email);
    }

    logger.info('Creating token in signinController ...');
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

    return new SuccessMsgResponse('success').send(res);
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
    if (!decodedToken) throw new TokenExpiredError();

    logger.info('Verifying token in verifySigninController ...');
    const user = await UserRepository.verifyToken(decodedToken.tokenId);
    if (!user) throw new TokenExpiredError();

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
    const data = { user: { isCompleted } };
    return new SuccessResponse('success', data).send(res);
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

  return new SuccessMsgResponse('success').send(res);
});

/**
 * Retrieves the authenticated user's profile.
 * @param req - The HTTP request object containing the user's ID from the authentication middleware.
 * @param res - The HTTP response object.
 * @returns The user's profile data.
 */
export const getMyDataController = catchAsync(async (req: IAuthenticatedRequest, res) => {
  const userId = req.userId;
  if (!userId) throw new TokenExpiredError();

  logger.info('Getting user information in getMyDataController ...');
  const user = await UserRepository.findById(userId.toString());
  if (!user) throw new TokenExpiredError();
  const { magicToken, refreshToken, ...safeUser } = user;

  return new SuccessResponse('success', safeUser).send(res);
});
