import { prisma } from '@/utils/connection';

/**
 * CategoryRepository class provides methods to interact with the Categories table in the database.
 * It includes method to fetch all categories.
 */
export class CategoryRepository {
  /**
   * Finds all categories.
   * @returns The list of all available categories.
   */

  static async findAll() {
    const categories = await prisma.category.findMany();
    return categories;
  }

  /**
   * Finds a category by its ID.
   * @param id - The ID of the category to find.
   * @returns The category with the specified ID, or null if not found.
   */
  static async findById(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    return category;
  }
}
