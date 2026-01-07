import config from '@/config/config';
import { UserRepository } from '@/repositories/user.repository';
import { TokenExpiredError } from '@/utils/apiError';
import {
  ForbiddenResponse,
  SuccessMsgResponse,
  SuccessResponse,
  BadRequestResponse,
} from '@/utils/apiResponse';
import { controller } from '@/utils/controller';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '@/utils/jwt';
import logger from '@/utils/logger';
import EmailService from '@/utils/sendEmail';
import googleClient from '@/utils/googleOAuth';
import {
  SigninSchema,
  googleSigninSchema,
  verifySigninSchema,
} from '@/validations/auth.validation';
import { emptySchema } from '@/validations/common';

/**
 * Handles user sign-in by creating a new user if they don't exist and sending a magic link.
 * @param req - The HTTP request object containing the user's email.
 * @param res - The HTTP response object.
 * @returns A success message.
 */
export const signinController = controller(SigninSchema, async (req, res) => {
  const { email } = req.body;
  const existingUser = await UserRepository.findbyEmail(email, null);

  let user;

  if (!existingUser || existingUser.isDeleted) {
    user = await UserRepository.create(email);
  } else {
    user = existingUser;
  }

  logger.info('Creating token in signinController ...');
  const token = await UserRepository.createToken(user.id);
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
});

/**
 * Handles Google OAuth sign-in by exchanging the authorization code for tokens,
 * verifying the Google ID token, and creating or fetching the user in the database.
 * It then generates and stores JWT access and refresh tokens for the user.
 *
 * @param req - The HTTP request object containing the Google authorization code in the body.
 * @param res - The HTTP response object used to set authentication cookies and return a response.
 * @returns A success response containing the user's profile completion status, or an error message if sign-in fails.
 */
export const googleSigninController = controller(googleSigninSchema, async (req, res) => {
  const { code } = req.body;
  const { tokens } = await googleClient.getToken(code);

  if (!tokens.id_token) {
    return new ForbiddenResponse('Google ID token is missing.').send(res);
  }

  const googleIdToken = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.GOOGLE_CLIENT_ID,
  });

  const payload = googleIdToken.getPayload();
  if (!payload?.email) {
    return new BadRequestResponse('Invalid Google user info.').send(res);
  }

  const { email, name } = payload;

  const existingUser = await UserRepository.findbyEmail(email, null);

  let user;
  if (!existingUser || existingUser.isDeleted) {
    user = await UserRepository.createUserByGoogleOAuth(email, name);
  } else {
    user = existingUser;
  }

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
  return new SuccessResponse('success', { user: { isCompleted } }).send(res);
});

/**
 * Generates the Google OAuth URL for frontend login redirection.
 */
export const googleOAuthUrlController = controller(emptySchema, async (req, res) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = {
    client_id: config.GOOGLE_CLIENT_ID,
    redirect_uri: config.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'email', 'profile'].join(' '),
  };

  const redirectUrl = `${rootUrl}?${new URLSearchParams(params).toString()}`;
  return res.json({ details: { redirect: redirectUrl } });
});

/**
 * Verifies the magic link token and generates access and refresh tokens for the user.
 * @param req - The HTTP request object containing the magic link token.
 * @param res - The HTTP response object.
 * @returns The user's access and refresh tokens along with their profile completion status.
 */
export const verifySigninController = controller(verifySigninSchema, async (req, res) => {
  const { token } = req.body;

  const decodedToken = verifyAccessToken(token);

  if (!decodedToken) throw new TokenExpiredError();

  logger.info('Verifying token in verifySigninController ...');
  const user = await UserRepository.verifyToken(decodedToken.userId, decodedToken.tokenId);
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
});

/**
 * Logs out the user by clearing their access and refresh tokens.
 * @param req - The HTTP request object containing the user's ID.
 * @param res - The HTTP response object.
 * @returns A 204 No Content response.
 */
export const logoutController = controller(emptySchema, async (req, res) => {
  const { userId } = req;
  if (!userId) throw new TokenExpiredError();

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
export const getMyDataController = controller(emptySchema, async (req, res) => {
  const { userId } = req;
  if (!userId) throw new TokenExpiredError();

  logger.info('Getting user information in getMyDataController ...');
  const user = await UserRepository.findById(userId.toString());
  if (!user) throw new TokenExpiredError();
  const { socialLinks, ...safeUser } = user;

  let website, instagram, twitter;

  socialLinks.map((social) => {
    if (social.type === 'TWITTER') twitter = social.handle;
    if (social.type === 'INSTAGRAM') instagram = social.handle;
    if (social.type === 'PERSONAL_WEBSITE') website = social.handle;
  });

  return new SuccessResponse('success', { website, twitter, instagram, ...safeUser }).send(res);
});
