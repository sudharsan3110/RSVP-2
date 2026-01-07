import { describe, it, expect, beforeEach, vi } from 'vitest';
vi.mock('@/repositories/category.repository', () => {
  return {
    CategoryRepository: {
      findAll: vi.fn(),
      findById: vi.fn(),
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
import { CategoryRepository } from '@/repositories/category.repository';
import logger from '@/utils/logger';
import { ApiError } from '@/utils/apiError';

import {
  getAllCategoryController,
  getCategoryByIdController,
} from '@/controllers/category.controller';

const mockCategoryRepository = vi.mocked(CategoryRepository);
const mockLogger = vi.mocked(logger);

// Helper constants for tests - Using VALID UUIDs
const VALID_UUID_1 = '550e8400-e29b-41d4-a716-446655440001';
const VALID_UUID_2 = '550e8400-e29b-41d4-a716-446655440002';
const VALID_UUID_3 = '550e8400-e29b-41d4-a716-446655440003';

const FAKE_CATEGORIES = [
  {
    id: VALID_UUID_1,
    name: 'Technology',
    description: 'Tech related events',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: VALID_UUID_2,
    name: 'Business',
    description: 'Business networking events',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: VALID_UUID_3,
    name: 'Entertainment',
    description: 'Entertainment and fun events',
    createdAt: new Date('2024-01-03'),
  },
];

const SINGLE_CATEGORY = {
  id: VALID_UUID_1,
  name: 'Technology',
  description: 'Tech related events',
  createdAt: new Date('2024-01-01'),
};

let app: ReturnType<typeof express>;

beforeEach(() => {
  vi.clearAllMocks();
  app = express();
  app.use(express.json());

  // Setup routes
  app.get('/categories', getAllCategoryController);
  app.get('/categories/:id', getCategoryByIdController);

  // Global error handler middleware (matching server.ts)
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiError) {
      ApiError.handle(err, res);
    } else {
      mockLogger.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
});

describe('Category Controllers', () => {
  describe('getAllCategoryController', () => {
    it('returns all categories successfully', async () => {
      mockCategoryRepository.findAll.mockResolvedValue(FAKE_CATEGORIES as any);

      const res = await request(app).get('/categories');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0]).toHaveProperty('id', VALID_UUID_1);
      expect(res.body.data[0]).toHaveProperty('name', 'Technology');

      expect(mockCategoryRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Getting all categories in getAllCategoryController ..'
      );
    });

    it('returns empty array when no categories exist', async () => {
      mockCategoryRepository.findAll.mockResolvedValue([]);

      const res = await request(app).get('/categories');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toHaveLength(0);

      expect(mockCategoryRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('returns 404 when findAll returns null', async () => {
      mockCategoryRepository.findAll.mockResolvedValue(null as any);

      const res = await request(app).get('/categories');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'No categories found');

      expect(mockCategoryRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('returns 404 when findAll returns undefined', async () => {
      mockCategoryRepository.findAll.mockResolvedValue(undefined as any);

      const res = await request(app).get('/categories');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'No categories found');

      expect(mockCategoryRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('handles database errors gracefully', async () => {
      mockCategoryRepository.findAll.mockRejectedValue(new Error('Database connection failed'));

      const res = await request(app).get('/categories');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getCategoryByIdController', () => {
    it('returns category by valid UUID successfully', async () => {
      mockCategoryRepository.findById.mockResolvedValue(SINGLE_CATEGORY as any);

      const res = await request(app).get(`/categories/${VALID_UUID_1}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'success');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id', VALID_UUID_1);
      expect(res.body.data).toHaveProperty('name', 'Technology');
      expect(res.body.data).toHaveProperty('description', 'Tech related events');

      expect(mockCategoryRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(VALID_UUID_1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Getting category by id in getCategoryByIdController ..'
      );
    });

    it('returns 404 when category not found', async () => {
      const nonExistentUuid = '123e4567-e89b-12d3-a456-426614174000';
      mockCategoryRepository.findById.mockResolvedValue(null);

      const res = await request(app).get(`/categories/${nonExistentUuid}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', `No category found for id: ${nonExistentUuid}`);

      expect(mockCategoryRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(nonExistentUuid);
    });

    it('returns 400 when id is not a valid UUID', async () => {
      const res = await request(app).get('/categories/invalid-id-123');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid request');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toBeInstanceOf(Array);

      // Verify repository was NOT called due to validation failure
      expect(mockCategoryRepository.findById).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      mockCategoryRepository.findById.mockRejectedValue(new Error('Database query failed'));

      const res = await request(app).get(`/categories/${VALID_UUID_1}`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('returns different categories for different valid UUIDs', async () => {
      const uuid1 = '550e8400-e29b-41d4-a716-446655440010';
      const uuid2 = '550e8400-e29b-41d4-a716-446655440020';

      const category1 = { ...SINGLE_CATEGORY, id: uuid1, name: 'Category 1' };
      const category2 = { ...SINGLE_CATEGORY, id: uuid2, name: 'Category 2' };

      // First call
      mockCategoryRepository.findById.mockResolvedValueOnce(category1 as any);
      const res1 = await request(app).get(`/categories/${uuid1}`);

      expect(res1.status).toBe(200);
      expect(res1.body.data).toHaveProperty('name', 'Category 1');

      // Second call
      mockCategoryRepository.findById.mockResolvedValueOnce(category2 as any);
      const res2 = await request(app).get(`/categories/${uuid2}`);

      expect(res2.status).toBe(200);
      expect(res2.body.data).toHaveProperty('name', 'Category 2');

      expect(mockCategoryRepository.findById).toHaveBeenCalledTimes(2);
    });
  });
});
