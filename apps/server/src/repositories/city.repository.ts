import { prisma } from '@/utils/connection';
import { Paginator } from '@/utils/pagination';

/**
 * CityRepository class provides methods to interact with the Cities table in the database.
 * It includes method to fetch all cities.
 */
export class CityRepository {
  static cityPaginator = new Paginator('city');
  /**
   * Finds all cities.
   * @returns The list of all available cities.
   */

  static async findAllCities({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const { data, metadata } = await this.cityPaginator.paginate(
      { page, limit, sortBy: 'name', sortOrder: 'asc' },
      {
        where: search ? { name: { contains: search } } : {},
      }
    );
    return { cities: data, metadata };
  }

  /**
   * Finds a city by its ID.
   * @param id - The ID of the city to find.
   * @returns The city with the specified ID, or null if not found.
   */
  static async findCityById(id: string) {
    return await prisma.city.findUnique({ where: { id } });
  }
}
