import { vi, beforeEach, describe, expect, it } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import {
  HTTP_OK,
  TEST_USER_ID,
  MOCK_STATE,
  MOCK_STATES,
  STATE_ID,
  COUNTRY_ID,
} from '@/utils/testConstants';
import { userRouter } from '@/routes/v1/users.routes';
import { stateRouter } from '@/routes/state.routes';
import { StateRepository } from '@/repositories/state.repository';
import request from 'supertest';

let isAuthenticated: boolean = true;

vi.mock('@/middleware/authMiddleware', () => {
  return {
    default: (req: Request, res: Response, next: NextFunction) => {
      if (isAuthenticated) {
        (req as any).userId = TEST_USER_ID;
        next();
      } else {
        return res.status(401).json({ message: 'Invalid or expired tokens' });
      }
    },
  };
});

const app = express();
app.use(express.json());
app.use('/users', userRouter);
app.use('/states', stateRouter);

beforeEach(() => {
  vi.resetAllMocks();
  isAuthenticated = true;
});

describe('State Router Endpoints', () => {
  describe('GET /states/:stateId (findStateById)', () => {
    it('should return a state by ID', async () => {
      vi.spyOn(StateRepository as any, 'findStateById').mockResolvedValue(MOCK_STATE as any);
      const res = await request(app).get(`/states/${STATE_ID}`);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('data', MOCK_STATE);
    });
  });

  describe('GET /states/country/:countryId (findStateByCountryId)', () => {
    it('should return states by country ID', async () => {
      vi.spyOn(StateRepository as any, 'findStateByCountryId').mockResolvedValue(
        MOCK_STATES as any
      );
      const res = await request(app).get(`/states/country/${COUNTRY_ID}`);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('data', MOCK_STATES);
    });
  });
});
