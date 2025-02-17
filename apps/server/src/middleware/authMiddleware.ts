import config from '@/config/config';
import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from '@/utils/jwt';
import { NextFunction, Request, Response } from 'express';
import { Users } from '@/db/models/users';

export interface AuthenticatedRequest<
  P = {},
  ResBody = {},
  ReqBody = { accessToken?: string; refreshToken?: string },
> extends Request<P, ResBody, ReqBody> {
  userId?: string;
}

/**
 * Checks for a refresh token in the request cookies or body, and verifies it.
 *
 * @param req - The authenticated request object containing cookies and body.
 * @returns The decoded token if verification is successful, otherwise false.
 */
const checkFromRefreshToken = async (req: AuthenticatedRequest) => {
  const refreshToken = req.cookies.refreshToken || req.headers.refreshToken;
  if (!refreshToken) return false;

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) return false;

  try {
    const user = await Users.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) return false;

    return decoded;
  } catch (error) {
    return false;
  }
};

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken || req.headers.accessToken;

    const accessTokenDecoded = token ? verifyAccessToken(token) : null;

    if (accessTokenDecoded) {
      req.userId = accessTokenDecoded.userId;
      return next();
    }

    const refreshDecoded = await checkFromRefreshToken(req);
    if (!refreshDecoded) {
      return res.status(401).json({ message: 'Invalid or expired tokens' });
    }

    const newAccessToken = generateAccessToken({ userId: refreshDecoded.userId });
    req.userId = refreshDecoded.userId;

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default authMiddleware;
