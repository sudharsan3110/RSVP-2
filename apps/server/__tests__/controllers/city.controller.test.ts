import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DUMMY_CITIES, DUMMY_CITY } from '@/utils/testConstants';
vi.mock('@/repositories/city.repository', () => {
  return {
    CityRepository: {
      findAllCities: vi.fn(),
      findCityById: vi.fn(),
    },
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
    },
  };
});

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { CityRepository } from '@/repositories/city.repository';
import logger from '@/utils/logger';
import { ApiError } from '@/utils/apiError';

import { getAllCitiesController, getCityByIdController } from '@/controllers/city.controller';

const mockCityRepository = vi.mocked(CityRepository);
const mockLogger = vi.mocked(logger);

let app: ReturnType<typeof express>;

beforeEach(() => {
  vi.clearAllMocks();
  app = express();
  app.use(express.json());

  app.get('/cities', getAllCitiesController);
  app.get('/cities/:id', getCityByIdController);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiError) {
      ApiError.handle(err, res);
    } else {
      mockLogger.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
});

describe('City Controllers', () => {
  describe('getAllCitiesController', () => {
    it('returns all cities with default pagination', async () => {
      mockCityRepository.findAllCities.mockResolvedValue(DUMMY_CITIES as any);

      const res = await request(app).get('/cities');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty('id', '1');
      expect(res.body.data[0]).toHaveProperty('name', 'dumb city');

      expect(mockCityRepository.findAllCities).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Getting all cities in getAllCitiesController .. page: 1, limit: 10'
      );
    });

    it('applies custom pagination parameters correctly', async () => {
      const customPage = 2;
      const customLimit = 5;
      mockCityRepository.findAllCities.mockResolvedValue(DUMMY_CITIES as any);

      const res = await request(app).get('/cities').query({ page: customPage, limit: customLimit });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');

      expect(mockCityRepository.findAllCities).toHaveBeenCalledWith(
        expect.objectContaining({
          page: customPage,
          limit: customLimit,
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Getting all cities in getAllCitiesController .. page: ${customPage}, limit: ${customLimit}`
      );
    });

    it('returns 404 when findAllCities returns null', async () => {
      mockCityRepository.findAllCities.mockResolvedValue(null as any);

      const res = await request(app).get('/cities');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'No cities found');

      expect(mockCityRepository.findAllCities).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCityByIdController', () => {
    it('return city by city id successfully', async () => {
      mockCityRepository.findCityById.mockResolvedValue(DUMMY_CITY as any);

      const res = await request(app).get(`/cities/1`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id', '1');
      expect(res.body.data).toHaveProperty('name', 'single dumb city');

      expect(mockCityRepository.findCityById).toHaveBeenCalledTimes(1);
      expect(mockCityRepository.findCityById).toHaveBeenCalledWith('1');
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Getting city by id'));
    });

    it('returns 404 when city not found', async () => {
      const nonExistingCityId = '1023000';
      mockCityRepository.findCityById.mockResolvedValue(null);

      const res = await request(app).get(`/cities/${nonExistingCityId}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', `No city found for id: ${nonExistingCityId}`);

      expect(mockCityRepository.findCityById).toHaveBeenCalledTimes(1);
      expect(mockCityRepository.findCityById).toHaveBeenCalledWith(nonExistingCityId);
    });
  });
});
