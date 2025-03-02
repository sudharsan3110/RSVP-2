import config from '@/config/config';
import { Users } from '@/db/models/users';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import catchAsync from '@/utils/catchAsync';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '@/utils/jwt';
import EmailService from '@/utils/sendEmail';
import { SigninSchema, verifySigninSchema } from '@/validations/auth.validation';
import { Request } from 'express';
import z from 'zod';

type SigninRequestBody = z.infer<typeof SigninSchema>;
export const signin = catchAsync(async (req: Request<{}, {}, SigninRequestBody>, res, next) => {
  const { email } = req.body;

  let user;
  const existinguser = await Users.userExists(email);

  if (existinguser) {
    user = existinguser;
  } else {
    user = await Users.createUser(email);
  }

  const token = await Users.createMagicLink(user.id);
  console.log(`${config.CLIENT_URL}?token=${token}`);

  if (config.env !== 'development') {
    await EmailService.send({
      id: 4,
      subject: 'Sign in to your account',
      recipient: email,
      body: {
        email,
        magicLink: `${config.CLIENT_URL}?token=${token}`,
      },
    });
  }

  return res.status(200).json({ message: 'success' });
});

type VerifySigninBody = z.infer<typeof verifySigninSchema>;
export const verifySignin = catchAsync(async (req: Request<{}, {}, VerifySigninBody>, res) => {
  const { token } = req.body;
  const decodedToken = verifyAccessToken(token);

  if (!decodedToken) {
    return res.status(401).json({ message: 'Token expired or invalid' });
  }

  const user = await Users.checkMagicLink(decodedToken.tokenId);

  if (!user) {
    return res.status(401).json({ message: 'Token expired or invalid' });
  }

  const accessToken = generateAccessToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  await Users.updateRefreshToken(user.id, refreshToken);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  const { is_completed } = user;
  return res.status(200).json({ data: { user: { is_completed } } });
});

export const logout = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  await Users.updateRefreshToken(userId, null);

  return res.status(204).send();
});

export const me = catchAsync(async (req: AuthenticatedRequest, res, next) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

  const user = await Users.findById(userId.toString());

  if (!user) return res.status(401).json({ message: 'Invalid or expired token' });

  return res.status(200).json({ message: 'success', data: user });
});
