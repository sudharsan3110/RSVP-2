import { ICreateEvent, IEventFilters } from '@/interface/event';
import { IPaginationParams } from '@/interface/pagination';
import { Paginator } from '@/utils/pagination';
import { EventFilter } from '@/validations/event.validation';
import { Event, Prisma, VenueType, Status } from '@prisma/client';
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
    startDate,
    endDate,
    location,
    sortOrder,
    search,
    sortBy,
  }: EventFilter) {
    const eventsPaginator = new Paginator('event');
    const currentDateTime = new Date();

    const where: Prisma.EventWhereInput = {
      ...(location && { location: location }),
      ...(category && { category: category }),
      isDeleted: false,
      isActive: true,
      OR: [
        {
          startTime: {
            gte: currentDateTime,
          },
        },
        {
          startTime: {
            lt: currentDateTime,
          },
          endTime: {
            gt: currentDateTime, 
          },
        },
      ],
    };

    if (startDate || endDate) {
      where.AND = [];

      if (startDate) {
        where.AND.push({
          startTime: { gte: startDate },
        });
      }

      if (endDate) {
        where.AND.push({
          endTime: { lte: endDate },
        });
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const { data, metadata } = await eventsPaginator.paginate(
      {
        page,
        limit,
        sortOrder,
        sortBy,
      },
      {
        where: where,
        include: {
          creator: {
            select: {
              profileIcon: true,
              fullName: true,
              userName: true,
            },
          },
        },
      }
    );

    return {
      events: data,
      metadata,
    };
  }

  /**
   * Finds an event by its slug.
   * @param slug - The slug of the event.
   * @returns The event object if found, otherwise null.
   */
  static async findbySlug(slug: string | undefined) {
    return await prisma.event.findUnique({
      where: { slug, isDeleted: false },
      include: {
        creator: {
          select: {
            profileIcon: true,
            fullName: true,
            userName: true,
          },
        },
        cohosts: {
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
    pagination = { page: 1, limit: 10 },
  }: {
    filters: IEventFilters;
    pagination: IPaginationParams;
  }) {
    const { userId, search, category, fromDate, toDate, venueType } = filters;
    const eventsPaginator = new Paginator('event');
    const { page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'desc' } = pagination;

    const where: Prisma.EventWhereInput = {
      ...(userId && { creatorId: userId, isDeleted: false }),
      ...(category && { category: category }),
      ...(fromDate &&
        toDate && {
          AND: [
            { startTime: { gte: fromDate, lte: toDate } },
            { endTime: { gte: fromDate, lte: toDate } },
          ],
        }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { category: { contains: search } },
        ],
      }),
      ...(venueType && { venueType: venueType as VenueType }),
    };

    const { data, metadata } = await eventsPaginator.paginate(
      {
        page,
        limit,
        sortOrder,
        sortBy,
      },
      { where: where, include: { creator: true } }
    );

    return {
      events: data,
      metadata,
    };
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
          },
        },
        cohosts: {
          select: {
            role: true,
            user: {
              select: {
                profileIcon: true,
                fullName: true,
                userName: true,
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

    const events = await prisma.event.findMany({
      where: {
        OR: [
          {
            startTime: {
              gte: currentDateTime,
            },
          },
          {
            startTime: {
              lt: currentDateTime,
            },
            endTime: {
              gt: currentDateTime,
            },
          },
        ],
        isActive: true,
        isDeleted: false,
        hostPermissionRequired: false,
      },
      include: {
        creator: {
          select: {
            fullName: true,
            profileIcon: true,
            userName: true,
          },
        },
        attendees: true,
      },
      orderBy: {
        attendees: {
          _count: 'desc',
        },
      },
      take,
    });
    return events;
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
}
