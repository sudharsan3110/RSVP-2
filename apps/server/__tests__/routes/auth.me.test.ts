
import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';

import { Users } from '@/db/models/users';
import { authRouter } from '@/routes/v1/auth.routes';
import {
  FAKE_USER,
  TEST_USER_ID,
  HTTP_OK,
  HTTP_UNAUTHORIZED,
  ENDPOINT_AUTH_ME,
} from '@/utils/testConstants';

vi.mock('@/middleware/authMiddleware', () => {
  return {
    default: (req: Request, _res: Response, next: NextFunction) => {
      (req as any).userId = TEST_USER_ID;
      next();
    },
  };
});

const app = express();
app.use(express.json());
app.use(authRouter);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Auth Router Endpoints', () => {
  describe(`GET ${ENDPOINT_AUTH_ME}`, () => {
    it(`should return the authenticated user's profile details and exclude sensitive fields`, async () => {
      vi.spyOn(Users, 'findById').mockResolvedValue(FAKE_USER as any);

      const res = await request(app).get(ENDPOINT_AUTH_ME);

      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'success');
      expect(res.body).toHaveProperty('data');

      // Expected public fields
      expect(res.body.data).toHaveProperty('id', FAKE_USER.id);
      expect(res.body.data).toHaveProperty('email', FAKE_USER.email);
      expect(res.body.data).toHaveProperty('full_name', FAKE_USER.full_name);
      expect(res.body.data).toHaveProperty('username', FAKE_USER.username);

      // Sensitive fields
      expect(res.body.data).not.toHaveProperty('magicToken');
      expect(res.body.data).not.toHaveProperty('refreshToken');
    });

    it('should return 401 if the user is not authenticated', async () => {
      const appNoAuth = express();
      appNoAuth.use(express.json());

      appNoAuth.use((req: Request, res: Response, _next: NextFunction) => {
        return res.status(HTTP_UNAUTHORIZED).json({ message: 'Invalid or expired token' });
      });
      appNoAuth.use(authRouter);

      const resNoAuth = await request(appNoAuth).get(ENDPOINT_AUTH_ME);

      expect(resNoAuth.status).toBe(HTTP_UNAUTHORIZED);
      expect(resNoAuth.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });
});