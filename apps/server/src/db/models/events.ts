import { prisma } from '../connection';
import { Paginator } from '@/utils/pagination';
import { CreateEventDto, IEventFilters } from '@/interface/event';
import { IPaginationParams } from '@/interface/pagination';
import { Event, Prisma, VenueType } from '@prisma/client';
import { EventFilter } from '@/validations/event.validation';

export class Events {
  static async create(eventDetails: CreateEventDto) {
    return await prisma.event.create({
      data: eventDetails,
    });
  }

  static async findAllEvents(userId?: string) {
    const where = userId ? { creatorId: userId } : {};
    return await prisma.event.findMany({
      where,
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
      data: { isCancelled: true, isActive: false },
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
    startDate,
    endDate,
    location,
    sortOrder,
    search,
    sortBy,
  }: EventFilter) {
    const eventsPaginator = new Paginator('event');

    const where: Prisma.EventWhereInput = {
      ...(location && { location: location }),
      ...(category && { category: category }),
      ...(endDate && { eventDate: { lte: endDate } }),
      ...(startDate && { eventDate: { gte: startDate } }),
    };



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
        where: where, include: {
          creator: {
            select: {
              profile_icon: true,
              full_name: true,
              username: true,
            },
          },
        }
      }
    );

    return {
      events: data,
      metadata,
    };

  }
}
