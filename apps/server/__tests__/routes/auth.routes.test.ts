import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { afterEach } from 'node:test';
import { createServer } from '@/server';
import { UserRepository } from '@/repositories/user.repository';
import { FAKE_USER, ENDPOINT_AUTH_ME } from '@/utils/testConstants';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt';
import { prisma } from '@/utils/connection';
import googleClient from '@/utils/googleOAuth';

vi.mock('@/utils/connection', () => ({
  prisma: {
    auth: {
      findFirst: vi.fn(),
    },
  },
}));

describe('Auth routes', () => {
  beforeAll(() => {
    process.env.CLIENT_URL = '*';
    process.env.NODE_ENV = 'development';
  });

  afterAll(() => {
    delete process.env.CLIENT_URL;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const app = createServer();

  describe('POST /signin', () => {
    it('400 - empty body', async () => {
      const res = await request(app).post('/v1/auth/signin').send();

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid request');
      expect(res.body.errors[0].message).toBe('Required');
    });

    it('400 - invalid email format', async () => {
      const res = await request(app).post('/v1/auth/signin').send({ email: 'test@test' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid request');
      expect(res.body.errors[0].message).toBe('Invalid email');
    });

    it('400 - Disposable email address', async () => {
      const res = await request(app).post('/v1/auth/signin').send({ email: 'test@temp-mail.com' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid request');
      expect(res.body.errors[0].message).toBe('Disposable email addresses are not allowed');
    });

    it('500 - Unexpected error', async () => {
      vi.spyOn(UserRepository, 'findbyEmail').mockImplementation(() => {
        throw new Error('error');
      });

      const res = await request(app).post('/v1/auth/signin').send({ email: 'test@gmail.com' });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('We are experiencing high traffic, please try again later');
    });

    it('200 - new user', async () => {
      vi.spyOn(UserRepository, 'findbyEmail').mockResolvedValue(null);
      vi.spyOn(UserRepository, 'create').mockResolvedValue({});
      vi.spyOn(UserRepository, 'createToken').mockResolvedValue('token');

      const res = await request(app).post('/v1/auth/signin').send({ email: 'test@gmail.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('success');
    });

    it('200 - existing user', async () => {
      vi.spyOn(UserRepository, 'findbyEmail').mockResolvedValue(FAKE_USER as any);
      // @ts-ignore
      vi.spyOn(UserRepository, 'create').mockResolvedValue({});
      vi.spyOn(UserRepository, 'createToken').mockResolvedValue('token');

      const res = await request(app).post('/v1/auth/signin').send({ email: 'test@gmail.com' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
    });
  });

  describe('POST /google-signin', () => {
    beforeAll(() => {
      process.env.GOOGLE_CLIENT_ID = 'client id';
    });

    afterAll(() => {
      delete process.env.GOOGLE_CLIENT_ID;
    });

    it('400 - Invalid body', async () => {
      const res = await request(app).post('/v1/auth/google-signin');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid request');
      expect(res.body).toHaveProperty('errors', [{ message: 'Required', path: 'body.code' }]);
    });

    it('403 - Google token missing', async () => {
      // @ts-ignore
      vi.spyOn(googleClient, 'getToken').mockResolvedValue({ tokens: { id_token: '' } });

      const res = await request(app).post('/v1/auth/google-signin').send({ code: 'code' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Google ID token is missing.');
    });

    it('500 - Google client verifyIdToken errors', async () => {
      // @ts-ignore
      vi.spyOn(googleClient, 'getToken').mockResolvedValue({ tokens: { id_token: 'some-token' } });
      vi.spyOn(googleClient, 'verifyIdToken').mockRejectedValue('Error');

      const res = await request(app).post('/v1/auth/google-signin').send({ code: 'code' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty(
        'message',
        'We are experiencing high traffic, please try again later'
      );
    });

    it('400 - googleIdToken getPayload error', async () => {
      // @ts-ignore
      vi.spyOn(googleClient, 'getToken').mockResolvedValue({ tokens: { id_token: 'some-token' } });
      // @ts-ignore
      vi.spyOn(googleClient, 'verifyIdToken').mockResolvedValue({
        getPayload: vi.fn().mockResolvedValue(null),
      });

      const res = await request(app).post('/v1/auth/google-signin').send({ code: 'code' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid Google user info.');
    });

    it('200 - success existing user', async () => {
      // @ts-ignore
      vi.spyOn(googleClient, 'getToken').mockResolvedValue({ tokens: { id_token: 'some-token' } });
      // @ts-ignore
      vi.spyOn(googleClient, 'verifyIdToken').mockResolvedValue({
        getPayload: vi.fn().mockReturnValue({ email: 'test-user@gmail.com' }),
      });
      vi.spyOn(UserRepository, 'findbyEmail').mockResolvedValue(FAKE_USER);

      const res = await request(app).post('/v1/auth/google-signin').send({ code: 'code' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
    });

    it('200 - success new user', async () => {
      // @ts-ignore
      vi.spyOn(googleClient, 'getToken').mockResolvedValue({ tokens: { id_token: 'some-token' } });
      // @ts-ignore
      vi.spyOn(googleClient, 'verifyIdToken').mockResolvedValue({
        getPayload: vi.fn().mockReturnValue({ email: 'test-user@gmail.com' }),
      });
      vi.spyOn(UserRepository, 'findbyEmail').mockResolvedValue(null);
      vi.spyOn(UserRepository, 'createUserByGoogleOAuth').mockResolvedValue(FAKE_USER);

      const res = await request(app).post('/v1/auth/google-signin').send({ code: 'code' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
    });
  });

  describe('POST /verify-signin', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('400 - Invalid body', async () => {
      const res = await request(app).post('/v1/auth/verify-signin');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid request');
      expect(res.body).toHaveProperty('errors', [{ message: 'Required', path: 'body.token' }]);
    });

    it('401 - Token expired', async () => {
      vi.useFakeTimers();
      const mockAccessToken = generateAccessToken(FAKE_USER);
      vi.advanceTimersByTime(1000 * 60 * 11);

      const res = await request(app)
        .post('/v1/auth/verify-signin')
        .send({ token: mockAccessToken });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Token expired or invalid');
    });

    it('401 - verifyToken failed', async () => {
      const mockAccessToken = generateAccessToken(FAKE_USER);

      vi.spyOn(UserRepository, 'verifyToken').mockResolvedValue(null);

      const res = await request(app)
        .post('/v1/auth/verify-signin')
        .send({ token: mockAccessToken });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Token expired or invalid');
    });

    it('200 - success', async () => {
      const mockAccessToken = generateAccessToken(FAKE_USER);

      vi.spyOn(UserRepository, 'verifyToken').mockResolvedValue(FAKE_USER);
      const res = await request(app)
        .post('/v1/auth/verify-signin')
        .send({ token: mockAccessToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
    });
  });

  describe('POST /logout', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('200 - success', async () => {
      const mockAccessToken = generateAccessToken({
        ...FAKE_USER,
        userId: 'test-user',
        socialLinks: [],
      });

      vi.spyOn(UserRepository, 'findById').mockResolvedValue({
        ...FAKE_USER,
        userId: 'test-user',
        socialLinks: [],
      });

      const res = await request(app)
        .post('/v1/auth/logout')
        .set('Cookie', [`accessToken=${mockAccessToken}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
    });
  });

  describe(`GET ${ENDPOINT_AUTH_ME}`, () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('401 - Unauthenticated', async () => {
      const res = await request(app).get('/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid or expired tokens');
    });

    it('401 - Expired refresh token', async () => {
      vi.useFakeTimers();

      const mockRefreshToken = generateRefreshToken(FAKE_USER);

      vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 8);

      const res = await request(app)
        .get('/v1/auth/me')
        .set('Cookie', 'refreshToken=' + mockRefreshToken);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid or expired tokens');
    });

    it('401 - Expired access and refresh token', async () => {
      vi.useFakeTimers();

      const mockRefreshToken = generateRefreshToken(FAKE_USER);
      const mockAccessToken = generateAccessToken(FAKE_USER);

      vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 8);

      const res = await request(app)
        .get('/v1/auth/me')
        .set('Cookie', ['accessToken=' + mockAccessToken, 'refreshToken=' + mockRefreshToken]);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid or expired tokens');
    });

    it('200 - Expired access and valid refresh token', async () => {
      vi.useFakeTimers();

      const mockRefreshToken = generateRefreshToken({
        ...FAKE_USER,
        userId: 'test-user',
        socialLinks: [],
      });
      const mockAccessToken = generateAccessToken(FAKE_USER);

      vi.advanceTimersByTime(1000 * 3600 * 24 * 2);
      vi.spyOn(UserRepository, 'findById').mockResolvedValue({
        ...FAKE_USER,
        userId: 'test-user',
        socialLinks: [],
      });
      vi.mocked(prisma.auth.findFirst).mockResolvedValue({ refreshToken: mockRefreshToken });

      const res = await request(app)
        .get('/v1/auth/me')
        .set('Cookie', ['accessToken=' + mockAccessToken, 'refreshToken=' + mockRefreshToken]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
    });

    it('200 - valid tokens', async () => {
      vi.useFakeTimers();

      const mockRefreshToken = generateRefreshToken({
        ...FAKE_USER,
        userId: 'test-user',
        socialLinks: [],
      });
      const mockAccessToken = generateAccessToken(FAKE_USER);

      vi.advanceTimersByTime(1000 * 3600 * 24);

      vi.spyOn(UserRepository, 'findById').mockResolvedValue({
        ...FAKE_USER,
        userId: 'test-user',
        socialLinks: [],
      });

      vi.mocked(prisma.auth.findFirst).mockResolvedValue({ refreshToken: mockRefreshToken });
      const res = await request(app)
        .get('/v1/auth/me')
        .set('Cookie', ['accessToken=' + mockAccessToken, 'refreshToken=' + mockRefreshToken]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
    });
  });
});
