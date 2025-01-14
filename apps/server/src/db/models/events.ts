import { prisma } from '../connection';
import { Paginator } from '@/utils/pagination';
import { CreateEventDto, IEventFilters } from '@/interface/event';
import { IPaginationParams } from '@/interface/pagination';
import { Event, Prisma } from '@prisma/client';

export class Events {
  static async create(eventDetails: CreateEventDto) {
    return await prisma.event.create({
      data: eventDetails,
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
    const eventsPaginator = new Paginator('Event');
    const { page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'desc' } = pagination;

    const where = {
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
      ...(venueType && { venueType: venueType }),
    };

    const { data, metadata } = await eventsPaginator.paginate(
      {
        page,
        limit,
        sortOrder,
        sortBy,
      },
      where
    );

    return {
      events: data,
      metadata,
    };
  }

  static async findById(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    return event;
  }

  static async update(eventId: string, data: Partial<Event>) {
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data,
    });
    return updatedEvent;
  }

  static async delete(eventId: string) {
    await prisma.event.delete({
      where: { id: eventId },
    });
  }

  static async findAllEvents() {
    const events = await prisma.event.findMany({
      orderBy: {
        Attendee: {
          _count: 'desc',
        },
      },
    });
    return events;
  }

  static async filterByCategory(category: string) {
    const events = await prisma.event.findMany({
      where: {
        category: category,
      },
    });

    return events;
  }

  static async filterByDate(startDate: string, endDate: string) {
    const events = await prisma.event.findMany({
      where: {
        eventDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: {
        eventDate: 'desc',
      },
    });

    return events;
  }

  static async filterByAttendes() {
    const events = await prisma.event.findMany({
      orderBy: {
        Attendee: {
          _count: 'desc',
        },
      },
    });

    return events;
  }

  static async filterByLocation(venueAddress: string) {
    const events = await prisma.event.findMany({
      where: {
        venueAddress: venueAddress,
      },
    });

    return events;
  }
}
