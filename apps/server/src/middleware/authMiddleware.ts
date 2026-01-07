import config from '@/config/config';
import { prisma } from '@/utils/connection';
import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from '@/utils/jwt';
import { NextFunction, Response } from 'express';
import { UserRepository } from '@/repositories/user.repository';
import { IAuthenticatedRequest } from '@/interface/middleware';

/**
 * Checks for a refresh token in the request cookies or body, and verifies it.
 *
 * @param req - The authenticated request object containing cookies and body.
 * @returns The decoded token if verification is successful, otherwise false.
 */
const checkFromRefreshToken = async (req: IAuthenticatedRequest) => {
  const refreshToken = req.cookies.refreshToken || req.headers.refreshToken;
  if (!refreshToken) return false;

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) return false;

  try {
    const user = await UserRepository.findById(decoded.userId);
    if (!user) return false;

    const auth = await prisma.auth.findFirst({
      where: { userId: user.id, provider: 'MAGIC_LINK' },
    });

    if (!auth || auth.refreshToken != refreshToken) return false;

    return decoded;
  } catch (error) {
    return false;
  }
};

const authMiddleware = async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
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
      secure: config.NODE_ENV === 'production',
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
