import { ICreateEvent } from '@/interface/event';
import { Paginator } from '@/utils/pagination';
import { EventFilter } from '@/validations/event.validation';
import { Event, Prisma, AttendeeStatus } from '@prisma/client';
import { prisma } from '@/utils/connection';

/**
 * EventRepository class provides methods to interact with the Events table in the database.
 * It includes methods for CRUD operations, pagination, and event-specific queries.
 */
export class EventRepository {
  /**
   * Retrieves public events based on filters, pagination, and sorting options.
   * @param params - The parameters for filtering, sorting, and pagination.
   * @returns An array of events matching the criteria.
   */
  static async findEvents({
    page,
    limit,
    category,
    location,
    startDate,
    endDate,
    sortOrder,
    search,
    sort,
  }: EventFilter) {
    const eventsPaginator = new Paginator('event');
    const currentDateTime = new Date();

    let sortBy = 'startTime';
    if (sort === 'date') {
      sortBy = 'startTime';
    } else if (sort === 'attendees') {
      sortBy = 'attendeeCount';
    }

    const where: Prisma.EventWhereInput = {
      ...(location && { location: location }),
      ...(category && { categoryId: category }),
      isDeleted: false,
      isActive: true,
      discoverable: true,
      endTime: { gte: currentDateTime },
    };

    if (startDate || endDate) {
      where.AND = [];
      if (startDate) where.AND.push({ startTime: { gte: startDate } });
      if (endDate) where.AND.push({ endTime: { lte: endDate } });
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        // search by category name via relation
        { category: { name: { contains: search } } },
      ];
    }

    const { data, metadata } = await eventsPaginator.paginate(
      { page, limit, sortOrder, sortBy },
      {
        where,
        include: {
          creator: {
            select: {
              profileIcon: true,
              fullName: true,
              userName: true,
              isDeleted: true,
            },
          },
          attendees: {
            where: {
              isDeleted: false,
            },
          },
          category: {
            // include category relation to get name
            select: {
              id: true,
              name: true,
            },
          },
        },
      }
    );

    return { events: data, metadata };
  }
  /**
   * Finds an event by its slug.
   * @param slug - The slug of the event.
   * @returns The event object if found, otherwise null.
   */
  static async findbySlug(slug: string) {
    return await prisma.event.findUnique({
      where: { slug, isDeleted: false },
      include: {
        creator: {
          select: {
            profileIcon: true,
            fullName: true,
            userName: true,
            isDeleted: true,
          },
        },
        hosts: {
          where: {
            isDeleted: false,
          },
          select: {
            role: true,
            user: {
              select: {
                profileIcon: true,
                fullName: true,
                userName: true,
                isDeleted: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Retrieves all planned events for a user with filters and pagination.
   * @param params - The filters and pagination options.
   * @returns An object containing the events and pagination metadata.
   */
  static async findAllPlannedEvents({
    filters,
    pagination = { page: 1, limit: 10, sortBy: 'startTime', sortOrder: 'desc' },
  }: {
    filters: { userId?: string; status?: string; search?: string };
    pagination: { page: number; limit: number; sortBy: string; sortOrder: 'asc' | 'desc' };
  }) {
    const { userId, status, search } = filters;
    const eventsPaginator = new Paginator('event');
    const { page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'desc' } = pagination;
    const currentDateTime = new Date();

    const where: Prisma.EventWhereInput = {
      ...(userId && { creatorId: userId }),
      isDeleted: false,
    };

    if (status && status !== 'all') {
      if (status === 'active') {
        where.isActive = true;
        where.endTime = { gte: currentDateTime };
      } else if (status === 'inactive') {
        where.OR = [
          { isActive: false },
          {
            isActive: true,
            endTime: { lt: currentDateTime },
          },
        ];
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        // search by category name via relation
        { category: { name: { contains: search } } },
      ];
    }

    const { data, metadata } = await eventsPaginator.paginate(
      { page, limit, sortOrder, sortBy },
      {
        where,
        include: {
          creator: true,
          attendees: {
            where: {
              isDeleted: false,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }
    );

    return { events: data, metadata };
  }
  /**
   * Finds an event by its unique ID.
   * @param eventId - The unique ID of the event.
   * @returns The event object if found, otherwise null.
   */
  static async findById(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId, isDeleted: false },
      include: {
        creator: {
          select: {
            profileIcon: true,
            fullName: true,
            userName: true,
            isDeleted: true,
          },
        },
        hosts: {
          where: { isDeleted: false },
          select: {
            role: true,
            userId: true,
            user: {
              select: {
                profileIcon: true,
                fullName: true,
                userName: true,
                isDeleted: true,
              },
            },
          },
        },
      },
    });
    return event;
  }

  /**
   * Retrieves popular events within the next 30 days.
   * @param take - The number of events to retrieve.
   * @returns An array of popular events.
   */
  static async findAllPopularEvents(take: number) {
    const currentDateTime = new Date();

    const popularEventGroups = await prisma.attendee.groupBy({
      by: ['eventId'],
      where: {
        isDeleted: false,
        status: AttendeeStatus.GOING,
        event: {
          isActive: true,
          isDeleted: false,
          hostPermissionRequired: false,
          discoverable: true,
          OR: [
            { startTime: { gte: currentDateTime } },
            { startTime: { lt: currentDateTime }, endTime: { gt: currentDateTime } },
          ],
        },
      },
      _count: { id: true },
      having: {
        id: { _count: { gte: 10 } },
      },
      orderBy: {
        _count: { id: 'desc' },
      },
    });

    const popularEventIds = popularEventGroups.map((g) => g.eventId);

    if (popularEventIds.length === 0) return [];

    const events = await prisma.event.findMany({
      where: {
        id: { in: popularEventIds },
      },
      include: {
        creator: {
          select: {
            fullName: true,
            profileIcon: true,
            userName: true,
          },
        },
      },
      take: take,
    });

    // Step 3: Preserve the popularity order
    const eventMap = new Map(events.map((e) => [e.id, e]));
    return popularEventIds
      .map((id) => eventMap.get(id))
      .filter((e): e is (typeof events)[0] => e !== undefined);
  }

  /**
   * Counts events created by a user in the current month, filtered by discoverable status.
   * Deleted events are excluded, but cancelled events are included.
   * @param creatorId - The unique ID of the creator.
   * @param discoverable - Whether to count public (true) or private (false) events.
   * @returns The count of events created this month.
   */
  static async countEventsCreatedThisMonth(creatorId: string, discoverable: boolean) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return await prisma.event.count({
      where: {
        creatorId,
        discoverable,
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
        OR: [
          // If the event is not deleted, it is always counted towards the limit
          { isDeleted: false },
          // If the event is deleted, it is only counted towards the limit if the event is in the past
          { isDeleted: true, endTime: { lt: now } },
        ],
      },
    });
  }

  /**
   * Creates a new event.
   * @param eventDetails - The details of the event to create.
   * @returns The newly created event object.
   */
  static async create(eventDetails: ICreateEvent) {
    return await prisma.event.create({
      data: eventDetails,
    });
  }

  /**
   * Updates an event by its ID.
   * @param eventId - The unique ID of the event.
   * @param data - The data to update.
   * @returns The updated event object.
   */
  static async update(eventId: string, data: Partial<Event>) {
    const updatedEvent = await prisma.event.update({
      where: { id: eventId, isDeleted: false },
      data,
    });
    return updatedEvent;
  }

  /**
   * Updates the slug of an event.
   * @param eventId - The unique ID of the event.
   * @param creatorId - The unique ID of the creator.
   * @param slug - The new slug for the event.
   * @returns The updated event object.
   */
  static async updateSlug(eventId: string, creatorId: string, slug: string) {
    return await prisma.event.update({
      where: { id: eventId, creatorId, isDeleted: false },
      data: { slug },
    });
  }

  /**
   * Cancels an event by setting its `isActive` status to false.
   * @param eventId - The unique ID of the event.
   * @param creatorId - The unique ID of the creator.
   * @returns The updated event object.
   */
  static async cancel(eventId: string, creatorId: string) {
    return await prisma.event.update({
      where: { id: eventId, creatorId },
      data: { isActive: false },
    });
  }

  /**
   * Soft deletes an event by setting its `isDeleted` status to true.
   * @param eventId - The unique ID of the event.
   * @param creatorId - The unique ID of the creator.
   * @returns The updated event object.
   */
  static async delete(eventId: string, creatorId: string) {
    return await prisma.event.update({
      where: { id: eventId, creatorId },
      data: { isDeleted: true, isActive: false },
    });
  }

  /**
   * Fetches the events by creator id.
   * The unique ID of the event.
   * @param creatorId - The unique ID of the creator.
   * @param startDate - Events hosted after this date.
   * @param endDate - Event hosted before this date.
   * @returns Array of events hosted by user based on filters..
   */
  static async getEventByCreatorId({
    creatorId,
    startDate,
    endDate,
  }: {
    creatorId: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const whereClause: Prisma.EventWhereInput = {
      creatorId,
    };

    if (startDate) {
      whereClause.startTime = {
        gte: startDate,
      };
    }

    if (endDate) {
      whereClause.endTime = {
        lt: endDate,
      };
    }

    return await prisma.event.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
