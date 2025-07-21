import { Paginator } from '@/utils/pagination';
import { Attendee, Prisma, Status } from '@prisma/client';
import { prisma } from '@/utils/connection';
import { IRegisteredEvent, IAttendeesByEvent } from '@/interface/attendees';

/**
 * AttendeeRepository class provides methods to interact with the Attendees table in the database.
 * It includes methods for CRUD operations, pagination, and attendee-specific queries.
 */
export class AttendeeRepository {
  static attendeePaginator = new Paginator('attendee');

  /**
   * Finds an attendee by their unique ID.
   * @param id - The unique ID of the attendee.
   * @returns The attendee object if found, otherwise null.
   */
  static async findById(id: string) {
    return await prisma.attendee.findUnique({
      where: { id, isDeleted: false },
    });
  }

  /**
   * Finds an attendee by their QR token and optionally the event ID.
   * @param qrToken - The QR token of the attendee.
   * @param eventId - The unique ID of the event (optional).
   * @returns The attendee object if found, including user details.
   */
  static async findByQrToken(qrToken: string, eventId?: string) {
    return await prisma.attendee.findUnique({
      where: { qrToken, eventId, isDeleted: false },
      include: {
        user: {
          select: {
            fullName: true,
            primaryEmail: true,
            contact: true,
            profileIcon: true,
          },
        },
      },
    });
  }

  /**
   * Finds an attendee by their user ID and event ID.
   * @param userId - The unique ID of the user.
   * @param eventId - The unique ID of the event.
   * @returns The attendee object if found, otherwise null.
   */
  static async findByUserIdAndEventId(
    userId: string,
    eventId: string,
    isDeleted: boolean | null = false
  ) {
    return await prisma.attendee.findFirst({
      where: {
        userId,
        eventId,
        isDeleted: isDeleted !== null ? isDeleted : undefined,
      },
    });
  }

  /**
   * Retrieves all attendees for a specific event.
   * @param eventId - The unique ID of the event.
   * @returns An array of attendees for the event.
   */
  static async findAllByEventId(eventId: string) {
    return await prisma.attendee.findMany({
      where: { eventId, isDeleted: false },
    });
  }

  /**
   * Retrieves all registered events for a specific user within a date range.
   * @param params - The parameters for filtering and pagination.
   * @returns An object containing the events and pagination metadata.
   */
  static async findRegisteredEventsByUser({
    userId,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  }: IRegisteredEvent) {
    const whereClause: Prisma.AttendeeWhereInput = {
      userId,
      isDeleted: false,
      AND: {
        event: { isDeleted: false },
      },
    };
    const currentDateTime = new Date();

    if (startDate) {
      whereClause.event = {
        OR: [
          {
            startTime: {
              gte: startDate,
            },
          },
          {
            startTime: {
              lt: startDate,
            },
            endTime: {
              gt: startDate,
            },
          },
        ],
      };
    }

    if (endDate) {
      if (whereClause.event) {
        whereClause.event = {
          AND: [
            whereClause.event,
            {
              startTime: {
                lte: endDate,
              },
            },
          ],
        };
      } else {
        whereClause.event = {
          startTime: {
            lte: endDate,
          },
        };
      }
    }

    const attendees = await prisma.attendee.findMany({
      where: whereClause,
      include: {
        event: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        event: {
          startTime: 'asc',
        },
      },
    });

    const totalCount = await prisma.attendee.count({ where: whereClause });

    return {
      events: attendees.map((attendee) => attendee.event),
      metadata: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Retrieves attendees for a specific event with pagination and filtering options.
   * @param params - The parameters for filtering, sorting, and pagination.
   * @returns A paginated list of attendees for the event.
   */
  static async findAttendeesByEventId({
    eventId,
    hasAttended,
    page = 1,
    limit = 10,
    sortBy = 'registrationTime',
    sortOrder = 'desc',
    search,
    status,
  }: IAttendeesByEvent) {
    const whereClause: Prisma.AttendeeWhereInput = {
      eventId,
      isDeleted: false,
      user: search
        ? {
            OR: [
              {
                fullName: {
                  contains: search,
                },
              },
              {
                primaryEmail: {
                  contains: search,
                },
              },
              {
                secondaryEmail: {
                  contains: search,
                },
              },
            ],
          }
        : undefined,
      hasAttended: hasAttended,
      ...(status &&
        status.length > 0 && {
          status: {
            in: status.map((s) => s as Status),
          },
        }),
    };

    return await this.attendeePaginator.paginate(
      { page, limit, sortBy, sortOrder },
      {
        where: whereClause,
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
        },
      }
    );
  }

  /**
   * Retrieves all attendees for a specific event, including user details.
   * @param eventId - The unique ID of the event.
   * @returns An array of attendees with user details.
   */
  static async findAllAttendees(eventId: string) {
    const attendees = await prisma.attendee.findMany({
      where: {
        eventId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            fullName: true,
            primaryEmail: true,
            contact: true,
          },
        },
      },
    });

    return attendees;
  }

  /**
   * Creates a new attendee record.
   * @param data - The data for the new attendee.
   * @returns The newly created attendee object.
   */
  static async create(data: Prisma.AttendeeCreateInput) {
    return await prisma.attendee.create({
      data,
    });
  }

  /**
   * Updates an attendee record by ID.
   * @param id - The unique ID of the attendee.
   * @param data - The data to update.
   * @returns The updated attendee object.
   */
  static async update(id: string, data: Prisma.AttendeeUpdateInput) {
    return await prisma.attendee.update({
      where: { id, isDeleted: false },
      data,
    });
  }

  /**
   * Counts the number of attendees for a specific event with a "GOING" status.
   * @param eventId - The unique ID of the event.
   * @returns The count of attendees with a "GOING" status.
   */
  static async countAttendees(eventId: string) {
    return await prisma.attendee.count({ where: { eventId, status: 'GOING' } });
  }

  /**
   * Updates the allowed status and status of an attendee for a specific event.
   * @param eventId - The unique ID of the event.
   * @param id - The unique ID of the attendee.
   * @param allowedStatus - The new allowed status.
   * @param status - The new status.
   * @returns The updated attendee object.
   */
  static async updateAttendeeStatus(id: string, allowedStatus: boolean) {
    return await prisma.attendee.update({
      where: {
        id,
        isDeleted: false,
      },
      data: {
        allowedStatus,
        status: allowedStatus ? Status.GOING : Status.WAITING,
      },
    });
  }

  /**
   * Updates the allowed status and status of multiple attendees for a specific event.
   * @param where - The where clause for filtering attendees.
   * @param status - The new status.
   * @returns The updated attendees.
   */
  static async updateMultipleAttendeesStatus(where: Prisma.AttendeeWhereInput, status: Status) {
    where.isDeleted = false;
    return await prisma.attendee.updateMany({
      where,
      data: {
        allowedStatus: true,
        status,
      },
    });
  }

  /**
   * Cancels an attendee record by ID. (Soft Delete)
   * @param id - The unique ID of the attendee.
   * @returns The updated attendee object with `status` set to `CANCELLED`.
   */
  static async cancel(id: string) {
    return await prisma.attendee.update({
      where: { id, isDeleted: false },
      data: {
        status: Status.CANCELLED,
        isDeleted: true,
        allowedStatus: false,
      },
    });
  }

  /**
   * Restores a soft-deleted attendee record by ID.
   * @param id - The unique ID of the attendee.
   * @returns The updated attendee object with `isDeleted` set to false.
   */
  static async restore(id: string, status: Status, allowedStatus: boolean) {
    return await prisma.attendee.update({
      where: { id, isDeleted: true, status: Status.CANCELLED },
      data: {
        status: status,
        isDeleted: false,
        allowedStatus: allowedStatus,
      },
    });
  }
}
