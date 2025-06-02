import { prisma } from '@/utils/connection';
import { Cohost, Role, Prisma } from '@prisma/client';

/**
 * CohostRepository class provides methods to interact with the Cohosts table in the database.
 * It includes methods for CRUD operations and cohost-specific queries.
 */
export class CohostRepository {
  /**
   * Finds a cohost by their unique ID.
   * @param id - The unique ID of the cohost.
   * @returns The cohost object if found, otherwise null.
   */
  static async findById(id: string): Promise<Cohost | null> {
    return await prisma.cohost.findFirst({
      where: { id, isDeleted: false },
    });
  }

  /**
   * Finds a cohost by their user ID and event ID.
   * @param userId - The unique ID of the user.
   * @param eventId - The unique ID of the event.
   * @returns The cohost object if found, otherwise null.
   */
  static async findByUserIdAndEventId(userId: string, eventId: string): Promise<Cohost | null> {
    return await prisma.cohost.findFirst({
      where: {
        userId,
        eventId,
        isDeleted: false,
      },
    });
  }

  /**
   * Retrieves all cohosts for a specific event.
   * @param eventId - The unique ID of the event.
   * @returns An array of cohosts for the event, including their roles and user details.
   */
  static async findAllByEventId(eventId: string) {
    return await prisma.cohost.findMany({
      where: { eventId, isDeleted: false },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            primaryEmail: true,
            contact: true,
            userName: true,
            profileIcon: true,
          },
        },
        event: true,
      },
    });
  }

  /**
   * Creates a new cohost record.
   * @param data - The data for the new cohost.
   * @returns The newly created cohost object.
   */
  static async create(data: Prisma.CohostCreateManyInput): Promise<Cohost> {
    return await prisma.cohost.create({
      data,
    });
  }

  /**
   * Updates a cohost record by ID.
   * @param id - The unique ID of the cohost.
   * @param data - The data to update.
   * @returns The updated cohost object.
   */
  static async update(id: string, data: Prisma.CohostUpdateInput): Promise<Cohost> {
    return await prisma.cohost.update({
      where: { id, isDeleted: false },
      data,
    });
  }

  /**
   * Soft deletes a cohost record by user ID and event ID.
   * @param userId - The unique ID of the user.
   * @param eventId - The unique ID of the event.
   * @returns A boolean indicating whether the cohost was successfully removed.
   */
  static async removeCoHost(cohostId: string, eventId: string): Promise<boolean> {
    const removedCohost = await prisma.cohost.updateMany({
      where: {
        id: cohostId,
        eventId,
        isDeleted: false,
      },
      data: { isDeleted: true },
    });

    return !!removedCohost;
  }

  /**
   * Soft deletes a cohost record by ID.
   * @param id - The unique ID of the cohost.
   * @returns The updated cohost object with `isDeleted` set to true.
   */
  static async delete(id: string): Promise<Cohost> {
    return await prisma.cohost.update({
      where: { id, isDeleted: false },
      data: { isDeleted: true },
    });
  }

  /**
   * Checks if a user is a host or cohost for a specific event with specific roles.
   * @param userId - The unique ID of the user.
   * @param eventId - The unique ID of the event.
   * @param roles - An array of roles to check (default: all roles).
   * @returns The cohost object if found, otherwise null.
   */
  static async FindhostOrCohost(
    userId: string,
    eventId: string,
    roles: Role[] = [Role.CREATOR, Role.MANAGER, Role.CELEBRITY, Role.READ_ONLY],
    returnType: boolean = false
  ): Promise<Role | boolean> {
    const cohost = await prisma.cohost.findFirst({
      where: {
        userId,
        eventId,
        role: {
          in: roles,
        },
      },
    });

    if (returnType) {
      return cohost?.role ?? false;
    }

    return !!cohost;
  }
}
