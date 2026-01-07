import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CityRepository } from '@/repositories/city.repository';
import { prisma } from '@/utils/connection';
import { DUMMY_CITIES, DUMMY_CITY } from '@/utils/testConstants';

vi.mock('@/utils/connection', () => ({
  prisma: {
    city: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('@/utils/pagination', () => {
  return {
    Paginator: vi.fn().mockImplementation(() => ({
      paginate: vi.fn(),
    })),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CityRepository', () => {
  describe('findAllCities', () => {
    const mockPaginate = vi.fn();

    beforeEach(() => {
      CityRepository.cityPaginator.paginate = mockPaginate;
      mockPaginate.mockResolvedValue({
        data: DUMMY_CITIES,
        metadata: { hasMore: false, limit: 10, page: 1, total: 2 },
      });
    });
    it('should return all cities with default pagination', async () => {
      const result = await CityRepository.findAllCities({ page: 1, limit: 10, search: 'Ajmiyah' });
      expect(mockPaginate).toHaveBeenCalledWith(
        { page: 1, limit: 10, sortBy: 'name', sortOrder: 'asc' },
        {
          where: {
            name: { contains: 'Ajmiyah' },
          },
        }
      );
      expect(result).toEqual({
        cities: DUMMY_CITIES,
        metadata: {
          total: DUMMY_CITIES.length,
          page: 1,
          limit: 10,
          hasMore: false,
        },
      });
    });

    it('should call paginate with correct parameters', async () => {
      await CityRepository.findAllCities({ page: 1, limit: 10, search: 'Ajmiyah' });

      expect(mockPaginate).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 10,
          sortBy: 'name',
          sortOrder: 'asc',
        },
        {
          where: {
            name: {
              contains: 'Ajmiyah',
            },
          },
        }
      );
    });
  });

  describe('findCityById', () => {
    it('should return a city by id', async () => {
      vi.mocked(prisma.city.findUnique).mockResolvedValue(DUMMY_CITY as any);
      const city = await CityRepository.findCityById('1');
      expect(city).toEqual(DUMMY_CITY);
    });

    it('should return null if city is not found', async () => {
      vi.mocked(prisma.city.findUnique).mockResolvedValue(null);
      const city = await CityRepository.findCityById('2');
      expect(city).toBeNull();
    });
  });
});
