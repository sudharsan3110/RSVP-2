import { prisma } from '@/utils/connection';
import { Paginator } from '@/utils/pagination';
import { Host, HostRole, Prisma } from '@prisma/client';

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
  static async findById(id: string): Promise<Host | null> {
    return await prisma.host.findFirst({
      where: { id, isDeleted: false },
    });
  }

  /**
   * Finds a cohost by their user ID and event ID.
   * @param userId - The unique ID of the user.
   * @param eventId - The unique ID of the event.
   * @returns The cohost object if found, otherwise null.
   */
  static async findByUserIdAndEventId(userId: string, eventId: string): Promise<Host | null> {
    return await prisma.host.findFirst({
      where: {
        userId,
        eventId,
      },
    });
  }

  /**
   * Retrieves all cohosts for a specific event.
   * @param eventId - The unique ID of the event.
   * @returns An array of cohosts for the event, including their roles and user details.
   */
  static async findAllByEventId(eventId: string) {
    return await prisma.host.findMany({
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
   * Retrieves all cohosts for a specific user.
   * @param userId - The unique ID of the user.
   * @param startDate - Events hosted after this date.
   * @param endDate - Events hosted before this date.
   * @param paginatedResult - If true, the result will be paginated.
   * @param paginationFilters - Additional filters for pagination.
   * @param pagination - Pagination options.
   * @returns A list of cohosts for the user, including their roles and user details.
   */
  static async findAllByUserId({
    userId,
    startDate,
    endDate,
    paginatedResult = false,
    paginationFilters,
    pagination = { page: 1, limit: 10, sortBy: 'startTime', sortOrder: 'desc' },
  }: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
    paginatedResult?: boolean;
    paginationFilters?: { status?: string; search?: string };
    pagination?: { page: number; limit: number; sortBy: string; sortOrder: 'asc' | 'desc' };
  }) {
    const whereClause: Prisma.HostWhereInput = {
      userId,
      isDeleted: false,
      user: {
        isDeleted: false,
      },
    };
    const eventWhereClause: Prisma.EventWhereInput = {
      isDeleted: false,
    };
    if (!paginatedResult) {
      whereClause.event = eventWhereClause;
      if (startDate) {
        whereClause.event = {
          startTime: {
            gte: startDate,
          },
        };
      }
      if (endDate) {
        whereClause.event = {
          endTime: {
            lt: endDate,
          },
        };
      }
      return await prisma.host.findMany({
        where: whereClause,
        include: {
          event: true,
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
        },
      });
    }

    const { status, search } = paginationFilters || {};
    const hostPaginator = new Paginator('host');
    const { page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'desc' } = pagination;
    const currentDateTime = new Date();
    if (status && status !== 'all') {
      if (status === 'active') {
        eventWhereClause.isActive = true;
        eventWhereClause.endTime = { gte: currentDateTime };
      } else if (status === 'inactive') {
        eventWhereClause.OR = [
          { isActive: false },
          {
            isActive: true,
            endTime: { lt: currentDateTime },
          },
        ];
      }
    }
    if (search) {
      eventWhereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { name: { contains: search } } },
      ];
    }
    whereClause.event = eventWhereClause;

    return await hostPaginator.paginate(
      { page, limit, sortOrder, sortBy },
      {
        where: whereClause,
        include: {
          event: {
            include: {
              creator: true,
              _count: {
                select: {
                  attendees: true,
                },
              },
            },
          },
          user: true,
        },
        distinct: ['eventId'],
      }
    );
  }
  /**
   * Creates a new cohost record.
   * @param data - The data for the new cohost.
   * @returns The newly created cohost object.
   */
  static async create(data: Prisma.HostCreateManyInput): Promise<Host> {
    return await prisma.host.create({
      data,
    });
  }

  /**
   * Updates a cohost record by ID.
   * @param id - The unique ID of the cohost.
   * @param data - The data to update.
   * @returns The updated cohost object.
   */
  static async update(id: string, data: Prisma.HostUpdateInput): Promise<Host> {
    return await prisma.host.update({
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
  static async removeCoHost(userId: string, eventId: string): Promise<boolean> {
    const removedCohost = await prisma.host.updateMany({
      where: {
        userId,
        eventId,
        isDeleted: false,
      },
      data: { isDeleted: true },
    });

    return removedCohost.count > 0;
  }

  /**
   * Soft deletes a cohost record by ID.
   * @param id - The unique ID of the cohost.
   * @returns The updated cohost object with `isDeleted` set to true.
   */
  static async delete(id: string): Promise<Host> {
    return await prisma.host.update({
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
    roles: HostRole[] = [
      HostRole.CREATOR,
      HostRole.MANAGER,
      HostRole.CELEBRITY,
      HostRole.READ_ONLY,
    ],
    returnType: boolean = false
  ): Promise<HostRole | boolean> {
    const cohost = await prisma.host.findFirst({
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

  /**
   * Restores a soft-deleted cohost record by ID.
   * @param id - The unique ID of the cohost.
   * @param role - The role assigned to the restored cohost: "Manager" | "ReadOnly" | "Celebrity".
   * @returns The updated cohost object with `isDeleted` set to false.
   */
  static async restore(id: string, role: HostRole): Promise<Host> {
    return await prisma.host.update({
      where: { id },
      data: {
        role: role,
        isDeleted: false,
      },
    });
  }
}
