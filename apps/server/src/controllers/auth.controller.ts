import catchAsync from '@/utils/catchAsync';
import { Request } from 'express';
import { SigninSchema, verifySigninSchema } from '@/validations/auth.validation';
import z from 'zod';
import { Users } from '@/db/models/users';
import config from '@/config/config';
import { generateJwtToken, verifyJwtToken } from '@/utils/jwt';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';

type SigninRequestBody = z.infer<typeof SigninSchema>;
export const signin = catchAsync(async (req: Request<{}, {}, SigninRequestBody>, res, next) => {
  const { email } = req.body;

  let user;
  const existinguser = await Users.userExists(email);

  if (existinguser) {
    user = existinguser;
    console.log(user);
    console.log('user already exist');
  } else {
    user = await Users.createUser(email);
  }

  const token = await Users.createMagicLink(user.id);
  console.log(`${config.CLIENT_URL}?token=${token}`);
  // Todo: send email

  return res.status(200).json({ message: 'success' });
});

type VerifySigninBody = z.infer<typeof verifySigninSchema>;
export const verifySignin = catchAsync(
  async (req: Request<{}, {}, VerifySigninBody>, res, next) => {
    const { token } = req.body;
    const decodedToken = verifyJwtToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Token expired or invalid' });
    }

    const user = await Users.checkMagicLink(decodedToken.tokenId);

    if (!user) {
      return res.status(401).json({ message: 'Token expired or invalid' });
    }

    const cookieToken = generateJwtToken({ userId: user.id }, '7d');

    res.cookie('authToken', cookieToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(200).json({ message: 'success' });
  }
);

export const me = catchAsync(async (req: AuthenticatedRequest, res, next) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

  const user = await Users.findById(userId);

  if (!user) return res.status(401).json({ message: 'Invalid or expired token' });

  return res.status(200).json({ message: 'success', data: user });
});
