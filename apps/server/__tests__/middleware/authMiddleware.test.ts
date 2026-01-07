import request from 'supertest';
import express from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import authMiddleware from '@/middleware/authMiddleware';
import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from '@/utils/jwt';
import { UserRepository } from '@/repositories/user.repository';
import { prisma } from '@/utils/connection';

vi.mock('@/repositories/user.repository', () => ({
  UserRepository: {
    findById: vi.fn(),
  },
}));

vi.mock('@/utils/connection', () => ({
  prisma: {
    auth: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
  generateAccessToken: vi.fn(),
}));

describe('authMiddleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(require('cookie-parser')());
    app.use(express.json());

    // Dummy protected route
    app.get('/protected', authMiddleware, (req: any, res) => {
      res.status(200).json({ message: 'ok', userId: req.userId });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should allow request when access token is valid', async () => {
    (verifyAccessToken as any).mockReturnValue({ userId: '101' });

    const res = await request(app).get('/protected').set('Cookie', ['accessToken=validToken']);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('101');
    expect(verifyAccessToken).toHaveBeenCalledWith('validToken');
  });

  it('should refresh token and allow request when refresh token is valid', async () => {
    (verifyAccessToken as any).mockReturnValue(null);

    (verifyRefreshToken as any).mockReturnValue({ userId: '101' });

    (UserRepository.findById as any).mockResolvedValue({ id: '101' });

    (prisma.auth.findFirst as any).mockResolvedValue({
      userId: '101',
      refreshToken: 'refresh123',
    });

    (generateAccessToken as any).mockReturnValue('newAccessToken');

    const res = await request(app)
      .get('/protected')
      .set('Cookie', ['accessToken=expired', 'refreshToken=refresh123']);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('101');
    expect(generateAccessToken).toHaveBeenCalledWith({ userId: '101' });

    expect(
      //@ts-ignore
      res.headers['set-cookie']?.some((c: string) => c.includes('accessToken=newAccessToken'))
    ).toBeTruthy();
  });

  it('should return 401 when both tokens are invalid', async () => {
    (verifyAccessToken as any).mockReturnValue(null);
    (verifyRefreshToken as any).mockReturnValue(null);

    const res = await request(app).get('/protected').set('Cookie', ['refreshToken=invalid']);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired tokens');
  });

  it('should return 401 if refresh token is invalid', async () => {
    (verifyAccessToken as any).mockReturnValue(null);
    (verifyRefreshToken as any).mockReturnValue(false);

    const res = await request(app).get('/protected').set('Cookie', ['refreshToken=bad-refresh']);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired tokens');
  });

  it('returns 401 when refresh token valid but user not found', async () => {
    (verifyAccessToken as any).mockReturnValue(null);
    (verifyRefreshToken as any).mockReturnValue({ userId: '101' });
    (UserRepository.findById as any).mockResolvedValue(null);

    const res = await request(app).get('/protected').set('Cookie', ['refreshToken=refresh123']);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired tokens');
  });

  it('returns 401 when refresh token does not match DB token', async () => {
    (verifyAccessToken as any).mockReturnValue(null);
    (verifyRefreshToken as any).mockReturnValue({ userId: '101' });

    (UserRepository.findById as any).mockResolvedValue({ id: '101' });

    (prisma.auth.findFirst as any).mockResolvedValue({
      refreshToken: 'DB-token',
    });

    const res = await request(app).get('/protected').set('Cookie', ['refreshToken=wrong-token']);

    expect(res.status).toBe(401);
  });

  it('should return 500 when unexpected error occurs', async () => {
    (verifyAccessToken as any).mockImplementation(() => {
      throw new Error('unexpected-error');
    });

    const res = await request(app).get('/protected').set('Cookie', ['accessToken=broken']);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
  });
});
