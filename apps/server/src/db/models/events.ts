import { prisma } from '../connection';
import { Paginator } from '@/utils/pagination';
import { CreateEventDto, IEventFilters } from '@/interface/event';
import { IPaginationParams } from '@/interface/pagination';
import { Event, Prisma, VenueType } from '@prisma/client';

export class Events {
  static async create(eventDetails: CreateEventDto) {
    return await prisma.event.create({
      data: eventDetails,
    });
  }

  static async findAllEvents() {
    return await prisma.event.findMany({
      include: {
        creator: {
          select: {
            full_name: true,
          },
        },
      },
    });
  }

  static async findUnique(where: Prisma.EventWhereUniqueInput) {
    return await prisma.event.findUnique({
      where,
      include: {
        creator: {
          select: {
            profile_icon: true,
            full_name: true,
            username: true,
          },
        },
        Cohost: {
          select: {
            role: true,
            user: {
              select: {
                profile_icon: true,
                full_name: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  static async plannedEvents({
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
      ...(userId && { creatorId: userId }),
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
      { where: where }
    );

    return {
      events: data,
      metadata,
    };
  }

  static async findById(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            profile_icon: true,
            full_name: true,
            username: true,
          },
        },
        Cohost: {
          select: {
            role: true,
            user: {
              select: {
                profile_icon: true,
                full_name: true,
                username: true,
              },
            },
          },
        },
      },
    });
    return event;
  }
  static async getPopularEvents(take: number) {
    const events = await prisma.event.findMany({
      where: {
        eventDate: {
          gte: new Date(),
          lte: new Date(new Date().setDate(new Date().getDate() + 30)), // Next 30 days
        },
        isActive: true,
        hostPermissionRequired: false,
      },
      include: {
        creator: {
          select: {
            full_name: true,
          },
        },
        Attendee: true,
      },
      orderBy: {
        Attendee: {
          _count: 'desc',
        },
      },
      take,
    });
    return events;
  }

  static async update(eventId: string, data: Partial<Event>) {
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data,
    });
    return updatedEvent;
  }

  static async updateSlug(eventId: string, creatorId: string, slug: string) {
    return await prisma.event.update({
      where: { id: eventId, creatorId },
      data: { slug },
    });
  }

  static async cancel(eventId: string, creatorId: string) {
    return await prisma.event.update({
      where: { id: eventId, creatorId },
      data: { isCancelled: true, isActive:false },
    });
  }
  static async delete(eventId: string, creatorId: string) {
    return await prisma.event.update({
      where: { id: eventId, creatorId },
      data: { isCancelled: true, isDeleted: true, isActive: false },
    });
  }

  static async findEvents({
    page,
    limit,
    category,
    sortby,
    venueAddress,
    query,
    order,
    startDate,
    endDate,
  }: {
    page: number;
    limit: number;
    category?: string;
    sortby?: string;
    venueAddress?: string;
    query?: string;
    order?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  }) {
    if (limit <= 0) {
      return [];
    }

    if (page <= 0) {
      page = 1;
    }

    const filters: any = {};

    if (category) {
      filters.category = category;
    }

    if (venueAddress) {
      filters.venueAddress = venueAddress;
    }

    if (query) {
      filters.name = {
        contains: query,
      };
    }

    try {
      const totalEvents = await prisma.event.count({ where: filters });

      const totalPages = Math.ceil(totalEvents / limit);

      if (totalPages === 0 || page > totalPages) {
        return [];
      }

      if (sortby == undefined) {
        sortby = 'createdAt';
      }

      const events = await prisma.event.findMany({
        where: filters,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortby]: 'desc',
        },
      });

      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events. Please try again later.');
    }
  }
}
