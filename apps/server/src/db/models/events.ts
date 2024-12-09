import { prisma } from '../connection';
import { Paginator } from '@/utils/pagination';
import { IEvent, IEventFilters } from '@/interface/event';
import { IPaginationParams } from '@/interface/pagination';
export class Events {
  static async create(eventDetails: IEvent) {
    const newEvent = await prisma.event.create({
      data: {
        ...eventDetails,
      },
    });
    return newEvent;
  }

  static async plannedEvents({
    filters,
    pagination = { page: 1, limit: 10 },
  }: {
    filters: IEventFilters;
    pagination: IPaginationParams;
  }) {
    const { email, type, fromDate, toDate, search } = filters;
    const eventsPaginator = new Paginator('Event');
    const { page = 1, limit = 10, sortBy = 'eventDate', sortOrder = 'asc' } = pagination;

    const where = {
      ...(type && { category: type }),
      ...(fromDate &&
        toDate && {
          eventDate: {
            gte: fromDate,
            lte: toDate,
          },
        }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ],
      }),
      Attendee: {
        some: {
          user: {
            primary_email: email,
          },
        },
      },
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

  static async update(eventId: string, data: Partial<IEvent>) {
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
}
