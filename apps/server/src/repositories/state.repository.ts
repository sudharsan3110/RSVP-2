import { prisma } from '@/utils/connection';

/**
 * StateRepository class provides methods to interact with the state table in the database.
 * It includes methods to fetch state objects based on state id or country Id.
 */
export class StateRepository {
  /**
   * Finds a state by its ID.
   * @param stateId - The ID of the state.
   * @returns The state object for the given state ID if found, otherwise null.
   */
  static async findStateById(stateId: string) {
    return prisma.state.findUnique({
      where: {
        id: stateId,
      },
    });
  }

  /**
   * Finds a state by its country ID.
   * @param countryId - The ID of the country.
   * @returns All the state objects for the given country ID if found, otherwise null.
   */
  static async findStateByCountryId(countryId: string) {
    return prisma.state.findMany({
      where: {
        countryId: countryId,
      },
    });
  }
}
