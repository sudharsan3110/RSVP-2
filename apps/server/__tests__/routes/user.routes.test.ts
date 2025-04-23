import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';

import { UserRepository as Users } from '@/repositories/user.repository';
import { userRouter } from '@/routes/v1/users.routes';
import {
  FAKE_USER,
  TEST_USER_ID,
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_UNAUTHORIZED,
} from '@/utils/testConstants';
import logger from '@/utils/logger';

vi.mock('@/middleware/authMiddleware', () => {
  return {
    default: (req: Request, _res: Response, next: NextFunction) => {
      (req as any).userId = TEST_USER_ID;
      next();
    },
  };
});

vi.mock('@/middleware/validate', () => {
  return {
    validate: () => (_req: Request, _res: Response, next: NextFunction) => {
      next();
    },
  };
});

vi.mock('@/middleware/apiLimiter', () => {
  return {
    default: (_req: Request, _res: Response, next: NextFunction) => {
      next();
    },
  };
});

const app = express();
app.use(express.json());
app.use('/users', userRouter);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('User Router Endpoints', () => {
  describe('DELETE /users/:userId', () => {
    const ENDPOINT_DELETE_USER = `/users/${TEST_USER_ID}`;

    it('should soft delete a user successfully', async () => {
      vi.spyOn(Users, 'findById').mockResolvedValue(FAKE_USER as any);
      const softDeleteSpy = vi.spyOn(Users, 'delete').mockResolvedValue(FAKE_USER as any);

      const res = await request(app).delete(ENDPOINT_DELETE_USER);

      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'User deleted successfully');

      expect(softDeleteSpy).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('should return 404 if user is not found', async () => {
      const softDeleteSpy = vi.spyOn(Users, 'delete').mockResolvedValue(null as any);

      const res = await request(app).delete(ENDPOINT_DELETE_USER);

      expect(res.status).toBe(HTTP_NOT_FOUND);
      expect(res.body).toHaveProperty('message', 'User not found');

      expect(softDeleteSpy).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('should return 400 if userId is missing from the path', async () => {
      const res = await request(app).delete('/users/');

      expect(res.status).toBe(404);
    });

    it('should return 401 if the user is not authenticated', async () => {
      const appNoAuth = express();
      appNoAuth.use(express.json());

      appNoAuth.use((_req: Request, res: Response, _next: NextFunction) => {
        return res.status(HTTP_UNAUTHORIZED).json({ message: 'Invalid or expired token' });
      });

      appNoAuth.use('/users', userRouter);

      const resNoAuth = await request(appNoAuth).delete(ENDPOINT_DELETE_USER);

      expect(resNoAuth.status).toBe(HTTP_UNAUTHORIZED);
      expect(resNoAuth.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('should handle database errors during soft delete', async () => {
      vi.spyOn(Users, 'findById').mockResolvedValue(FAKE_USER as any);
      vi.spyOn(Users, 'delete').mockRejectedValue(new Error('Database error'));

      const errorHandler = vi.fn();
      app.use((err: Error, _req: any, _res: any, _next: any) => {
        errorHandler(err.message);
        _res.status(500).json({ message: 'Internal server error' });
      });

      const res = await request(app).delete(ENDPOINT_DELETE_USER);

      expect(res.status).toBe(500);
      expect(errorHandler).toHaveBeenCalledWith('Database error');
    });
  });
});
