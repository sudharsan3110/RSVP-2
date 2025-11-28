import { describe, it, expect, beforeEach, vi } from 'vitest';
vi.mock('@/repositories/user.repository', () => {
  return {
    UserRepository: {
      findbyEmail: vi.fn(),
      create: vi.fn(),
      createUserByGoogleOAuth: vi.fn(),
      createToken: vi.fn(),
      updateRefreshToken: vi.fn(),
      verifyToken: vi.fn(),
      findById: vi.fn(),
    },
  };
});

vi.mock('@/utils/sendEmail', () => {
  return {
    default: {
      send: vi.fn(),
    },
  };
});

vi.mock('@/utils/googleOAuth', () => {
  return {
    default: {
      getToken: vi.fn(),
      verifyIdToken: vi.fn(),
    },
  };
});

vi.mock('@/utils/jwt', () => {
  return {
    generateAccessToken: vi.fn(() => 'access-token'),
    generateRefreshToken: vi.fn(() => 'refresh-token'),
    verifyAccessToken: vi.fn(),
  };
});
vi.mock('@/utils/logger', () => {
  return {
    default: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
  };
});

vi.mock('@/config/config', () => {
  return {
    default: {
      NODE_ENV: 'development',
      CLIENT_URL: 'http://localhost:3000',
      GOOGLE_CLIENT_ID: 'google-client-id',
      GOOGLE_REDIRECT_URI: 'http://localhost:3000/auth/google/callback',
    },
  };
});
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { UserRepository } from '@/repositories/user.repository';
import EmailService from '@/utils/sendEmail';
import googleClient from '@/utils/googleOAuth';
import * as jwtUtils from '@/utils/jwt';
import config from '@/config/config';
import logger from '@/utils/logger';
import { ApiError } from '@/utils/apiError';

import {
  signinController,
  googleSigninController,
  googleOAuthUrlController,
  verifySigninController,
  logoutController,
  getMyDataController,
} from '@/controllers/auth.controller';

const TEST_USER_ID = 'user-123';
const FAKE_USER = {
  id: TEST_USER_ID,
  isCompleted: false,
  isDeleted: false,
  socialLinks: [
    { type: 'TWITTER', handle: 'tw' },
    { type: 'INSTAGRAM', handle: 'ig' },
    { type: 'PERSONAL_WEBSITE', handle: 'site.com' },
  ],
};
const mockUserRepository = vi.mocked(UserRepository);
const mockEmailService = vi.mocked(EmailService);
const mockGoogleClient = vi.mocked(googleClient);
const mockJwtUtils = vi.mocked(jwtUtils);
const mockLogger = vi.mocked(logger);

let app: ReturnType<typeof express>;

beforeEach(() => {
  vi.clearAllMocks();
  app = express();
  app.use(express.json());

  app.post('/auth/signin', signinController);
  app.post('/auth/google', googleSigninController);
  app.get('/auth/google/url', googleOAuthUrlController);
  app.post('/auth/verify', verifySigninController);

  const authStub = (req: Request, _res: Response, next: NextFunction) => {
    const id = req.headers['x-test-userid'] as string | undefined;
    if (id === 'MISSING') {
      return next();
    }
    (req as any).userId = id ?? TEST_USER_ID;
    next();
  };

  app.post('/auth/logout', authStub, logoutController);
  app.get('/auth/me', authStub, getMyDataController);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiError) {
      ApiError.handle(err, res);
    } else {
      mockLogger.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
});
describe('Auth Controllers', () => {
  describe('signinController', () => {
    it('creates new user when not found and returns success', async () => {
      mockUserRepository.findbyEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({ id: TEST_USER_ID } as any);
      mockUserRepository.createToken.mockResolvedValue('magic-token');

      const res = await request(app).post('/auth/signin').send({ email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.create).toHaveBeenCalledWith('test@example.com');
      expect(mockEmailService.send).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('uses existing user and still returns success', async () => {
      mockUserRepository.findbyEmail.mockResolvedValue({
        id: TEST_USER_ID,
        isDeleted: false,
      } as any);
      mockUserRepository.createToken.mockResolvedValue('magic-token');

      const res = await request(app).post('/auth/signin').send({ email: 'existing@example.com' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.createToken).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('creates new user when existing user is deleted', async () => {
      mockUserRepository.findbyEmail.mockResolvedValue({
        id: 'deleted-user-id',
        isDeleted: true,
      } as any);
      mockUserRepository.create.mockResolvedValue({ id: TEST_USER_ID } as any);
      mockUserRepository.createToken.mockResolvedValue('magic-token');

      const res = await request(app).post('/auth/signin').send({ email: 'deleted@example.com' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.create).toHaveBeenCalledWith('deleted@example.com');
    });
  });

  describe('googleSigninController', () => {
    it('authenticates new user via google, sets cookies and returns user isCompleted', async () => {
      mockGoogleClient.getToken.mockResolvedValue({ tokens: { id_token: 'id-token' } } as any);
      const verified = { getPayload: () => ({ email: 'g@example.com', name: 'G User' }) };
      mockGoogleClient.verifyIdToken.mockResolvedValue(verified as any);

      mockUserRepository.findbyEmail.mockResolvedValue(null);
      mockUserRepository.createUserByGoogleOAuth.mockResolvedValue({
        id: TEST_USER_ID,
        isCompleted: true,
      } as any);
      mockUserRepository.updateRefreshToken.mockResolvedValue(undefined);

      const res = await request(app).post('/auth/google').send({ code: 'some-code' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('isCompleted', true);

      // Verify cookies are set
      const setCookies = res.headers['set-cookie'];
      expect(setCookies).toBeDefined();
      expect(Array.isArray(setCookies)).toBe(true);

      // Verify refresh token was updated
      expect(mockUserRepository.updateRefreshToken).toHaveBeenCalledWith(
        TEST_USER_ID,
        'refresh-token'
      );
    });

    it('authenticates existing user via google and returns user data', async () => {
      mockGoogleClient.getToken.mockResolvedValue({ tokens: { id_token: 'id-token' } } as any);
      const verified = {
        getPayload: () => ({ email: 'existing@example.com', name: 'Existing User' }),
      };
      mockGoogleClient.verifyIdToken.mockResolvedValue(verified as any);

      mockUserRepository.findbyEmail.mockResolvedValue({
        id: TEST_USER_ID,
        isCompleted: false,
        isDeleted: false,
      } as any);
      mockUserRepository.updateRefreshToken.mockResolvedValue(undefined);

      const res = await request(app).post('/auth/google').send({ code: 'existing-code' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(mockUserRepository.createUserByGoogleOAuth).not.toHaveBeenCalled();
      expect(mockUserRepository.updateRefreshToken).toHaveBeenCalled();
      expect(res.body.data.user).toHaveProperty('isCompleted', false);
    });

    it('creates new user when existing google user is deleted', async () => {
      mockGoogleClient.getToken.mockResolvedValue({ tokens: { id_token: 'id-token' } } as any);
      const verified = {
        getPayload: () => ({ email: 'deleted@example.com', name: 'Deleted User' }),
      };
      mockGoogleClient.verifyIdToken.mockResolvedValue(verified as any);

      mockUserRepository.findbyEmail.mockResolvedValue({
        id: 'old-deleted-id',
        isDeleted: true,
      } as any);
      mockUserRepository.createUserByGoogleOAuth.mockResolvedValue({
        id: TEST_USER_ID,
        isCompleted: true,
      } as any);
      mockUserRepository.updateRefreshToken.mockResolvedValue(undefined);

      const res = await request(app).post('/auth/google').send({ code: 'deleted-code' });

      expect(res.status).toBe(200);
      expect(mockUserRepository.createUserByGoogleOAuth).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.createUserByGoogleOAuth).toHaveBeenCalledWith(
        'deleted@example.com',
        'Deleted User'
      );
    });

    it('returns 403 if google id_token missing', async () => {
      mockGoogleClient.getToken.mockResolvedValue({ tokens: {} } as any);

      const res = await request(app).post('/auth/google').send({ code: 'no-id' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message');
    });

    it('returns 400 if payload email missing', async () => {
      mockGoogleClient.getToken.mockResolvedValue({ tokens: { id_token: 'id' } } as any);
      const verified = { getPayload: () => ({ name: 'No Email' }) };
      mockGoogleClient.verifyIdToken.mockResolvedValue(verified as any);

      const res = await request(app).post('/auth/google').send({ code: 'no-email' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('googleOAuthUrlController', () => {
    it('returns a redirect url with configured client id and redirect uri', async () => {
      const res = await request(app).get('/auth/google/url');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('details');
      expect(res.body.details).toHaveProperty('redirect');

      const redirect = new URL(res.body.details.redirect as string);
      expect(redirect.searchParams.get('client_id')).toEqual(config.GOOGLE_CLIENT_ID);
      expect(redirect.searchParams.get('redirect_uri')).toEqual(config.GOOGLE_REDIRECT_URI);
      expect(redirect.searchParams.get('scope')).toEqual('openid email profile');
    });
  });

  describe('verifySigninController', () => {
    it('verifies token, sets cookies and returns user isCompleted', async () => {
      mockJwtUtils.verifyAccessToken.mockReturnValue({
        userId: TEST_USER_ID,
        tokenId: 'token-1',
      } as any);
      mockUserRepository.verifyToken.mockResolvedValue({
        id: TEST_USER_ID,
        isCompleted: false,
      } as any);
      mockUserRepository.updateRefreshToken.mockResolvedValue(undefined);

      const res = await request(app).post('/auth/verify').send({ token: 'valid-token' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(res.body.data.user).toHaveProperty('isCompleted', false);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();

      expect(mockJwtUtils.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserRepository.verifyToken).toHaveBeenCalledWith(TEST_USER_ID, 'token-1');
      expect(mockUserRepository.updateRefreshToken).toHaveBeenCalledWith(
        TEST_USER_ID,
        'refresh-token'
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('returns 401 when token is invalid (verifyAccessToken returns null)', async () => {
      mockJwtUtils.verifyAccessToken.mockReturnValue(null);

      const res = await request(app).post('/auth/verify').send({ token: 'invalid' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(mockUserRepository.verifyToken).not.toHaveBeenCalled();
    });

    it('returns 401 when verifyToken returns null (token expired)', async () => {
      mockJwtUtils.verifyAccessToken.mockReturnValue({
        userId: TEST_USER_ID,
        tokenId: 'token-expired',
      } as any);
      mockUserRepository.verifyToken.mockResolvedValue(null);

      const res = await request(app).post('/auth/verify').send({ token: 'expired-token' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(mockUserRepository.verifyToken).toHaveBeenCalledWith(TEST_USER_ID, 'token-expired');
    });
  });

  describe('logoutController', () => {
    it('clears cookies and updates refresh token to null for authenticated user', async () => {
      mockUserRepository.updateRefreshToken.mockResolvedValue(undefined);

      const res = await request(app).post('/auth/logout').set('x-test-userid', TEST_USER_ID).send();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');

      expect(mockUserRepository.updateRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.updateRefreshToken).toHaveBeenCalledWith(TEST_USER_ID, null);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);
    });

    it('returns 401 when userId missing (token expired)', async () => {
      const res = await request(app).post('/auth/logout').set('x-test-userid', 'MISSING').send();

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(mockUserRepository.updateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('getMyDataController', () => {
    it('returns user profile with social links mapped to fields', async () => {
      mockUserRepository.findById.mockResolvedValue(FAKE_USER as any);

      const res = await request(app).get('/auth/me').send();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(res.body.data).toHaveProperty('website', 'site.com');
      expect(res.body.data).toHaveProperty('twitter', 'tw');
      expect(res.body.data).toHaveProperty('instagram', 'ig');
      expect(res.body.data).toHaveProperty('id', TEST_USER_ID);
      expect(res.body.data).toHaveProperty('isCompleted', false);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(TEST_USER_ID);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('returns 401 when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const res = await request(app).get('/auth/me').send();

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('returns 401 when userId missing', async () => {
      const res = await request(app).get('/auth/me').set('x-test-userid', 'MISSING').send();

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });
  });
});
