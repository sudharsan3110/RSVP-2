import { IPaginationParams, IPaginatedResult } from '@/interface/pagination';
import { prisma } from '@/utils/connection';
import { Prisma, PrismaClient } from '@prisma/client';

export class Paginator<T extends keyof PrismaClient> {
  constructor(private readonly prismaModel: T) {}

  async paginate<K extends Prisma.Args<PrismaClient[T], 'findMany'>>(
    params: IPaginationParams,
    args: K = {} as K
  ): Promise<IPaginatedResult<Prisma.Result<PrismaClient[T], 'findMany', K>>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    if (sortBy === 'attendeeCount' && this.prismaModel === 'event') {
      const queryArgs = { ...args };
      if (!queryArgs.include) queryArgs.include = {};
      if (!queryArgs.include.attendees) queryArgs.include.attendees = {};
      if (!queryArgs.include.attendees.where) queryArgs.include.attendees.where = {};

      queryArgs.include.attendees.where = {
        ...queryArgs.include.attendees.where,
        isDeleted: false,
        status: 'GOING',
      };

      const events = await (prisma[this.prismaModel] as any).findMany(queryArgs);

      const total = await (prisma[this.prismaModel] as any).count({
        where: queryArgs.where,
      });

      const sortedEvents = [...events].sort((a, b) => {
        const countA = a.attendees.length;
        const countB = b.attendees.length;

        if (countA !== countB) {
          return sortOrder === 'asc' ? countA - countB : countB - countA;
        }

        const dateA = new Date(a.startTime).getTime();
        const dateB = new Date(b.startTime).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });

      const skip = (page - 1) * limit;
      const paginatedEvents = sortedEvents.slice(skip, skip + limit);

      return {
        data: paginatedEvents,
        metadata: {
          total,
          page,
          limit,
          hasMore: skip + paginatedEvents.length < total,
        },
      };
    }

    const skip = (page - 1) * limit;
    const take = parseInt(limit.toString(), 10);

    const findManyArgs = {
      ...args,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
    };

    const [total, items] = await Promise.all([
      (prisma[this.prismaModel] as any).count({ where: args.where }),
      (prisma[this.prismaModel] as any).findMany(findManyArgs),
    ]);

    const hasMore = skip + items.length < total;

    return {
      data: items,
      metadata: {
        total,
        page,
        limit,
        hasMore,
      },
    };
  }
}
