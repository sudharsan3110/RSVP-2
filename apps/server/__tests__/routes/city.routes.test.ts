import { vi, beforeEach, describe, expect, it } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import { HTTP_OK, TEST_USER_ID } from '@/utils/testConstants';
import { userRouter } from '@/routes/v1/users.routes';
import { cityRouter } from '@/routes/v1/city.routes';
import { CityRepository } from '@/repositories/city.repository';
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
app.use('/cities', cityRouter);

beforeEach(() => {
  vi.resetAllMocks();
  isAuthenticated = true;
});

describe('City Router Endpoints', () => {
  describe('GET /cities/:cityId (findCityById)', () => {
    it('should return a city by ID', async () => {
      const cityId = '1';
      const mockCity = {
        id: cityId,
        name: 'New York',
        country_id: '1',
      };
      vi.spyOn(CityRepository as any, 'findCityById').mockResolvedValue(mockCity as any);
      const res = await request(app).get(`/cities/${cityId}`);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('data', mockCity);
    });
  });

  describe('GET /cities/ (getAllCities)', () => {
    it('should return all cities', async () => {
      const mockCities = [
        { id: '1', name: 'New York', country_id: '1' },
        { id: '2', name: 'Los Angeles', country_id: '1' },
      ];
      vi.spyOn(CityRepository as any, 'findAllCities').mockResolvedValue(mockCities as any);
      const res = await request(app).get(`/cities/`);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('data', mockCities);
    });
  });
});
