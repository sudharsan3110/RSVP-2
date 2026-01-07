import { prisma } from '@/utils/connection';

/**
 * CountryRepository class provides methods to interact with the Countries table in the database.
 * It includes method to fetch all countries.
 */
export class CountryRepository {
  /**
   * Finds all countries.
   * @returns The list of all available countries.
   */

  static async findAll() {
    const countries = await prisma.country.findMany();
    return countries;
  }

  /**
   * Finds a country by its ID.
   * @param id - The ID of the country to find.
   * @returns The country with the specified ID, or null if not found.
   */
  static async findById(id: string) {
    const country = await prisma.country.findUnique({ where: { id } });
    return country;
  }
}
