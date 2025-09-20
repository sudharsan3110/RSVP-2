import config from '@/config/config';
import { JwtPayload, sign, verify } from 'jsonwebtoken';

export const generateAccessToken = (payload: JwtPayload): string => {
  return sign(payload, config.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return sign(payload, config.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return verify(token, config.ACCESS_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return verify(token, config.REFRESH_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};
