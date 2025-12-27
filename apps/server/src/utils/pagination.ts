import {
  IPaginationParams,
  IPaginatedResult,
  HostWithEventAndAttendees,
} from '@/interface/pagination';
import { prisma } from '@/utils/connection';
import { Prisma, PrismaClient } from '@prisma/client';
import { isObject } from '@/utils/function';

export class Paginator<T extends keyof PrismaClient> {
  constructor(private readonly prismaModel: T) {}

  async paginate<K extends Prisma.Args<PrismaClient[T], 'findMany'>>(
    params: IPaginationParams,
    args: K = {} as K
  ): Promise<IPaginatedResult<Prisma.Result<PrismaClient[T], 'findMany', K>>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    // 1. Sort Events by Attendee Count
    if (sortBy === 'attendeeCount' && this.prismaModel === 'event') {
      const queryArgs = { ...args };

      // Init nested objects to safely attach filters (handles null/undefined/true)
      if (!isObject(queryArgs.include)) queryArgs.include = {};
      if (!isObject(queryArgs.include.attendees)) queryArgs.include.attendees = {};
      if (!isObject(queryArgs.include.attendees.where)) queryArgs.include.attendees.where = {};

      // Filter: Only count active/going attendees
      queryArgs.include.attendees.where = {
        ...queryArgs.include.attendees.where,
        isDeleted: false,
        status: 'GOING',
      };

      const events = await (prisma[this.prismaModel] as any).findMany(queryArgs);
      const total = await (prisma[this.prismaModel] as any).count({ where: queryArgs.where });

      // Sort in memory
      const sortedEvents = [...events].sort((a, b) => {
        const diff = a.attendees.length - b.attendees.length;
        return sortOrder === 'asc' ? diff : -diff;
      });

      const skip = (page - 1) * limit;
      const paginatedEvents = sortedEvents.slice(skip, skip + limit);

      return {
        data: paginatedEvents,
        metadata: { total, page, limit, hasMore: skip + paginatedEvents.length < total },
      };
    }

    // 2. Sort Hosts by Attendee Count (via Event)
    if (sortBy === 'attendeeCount' && this.prismaModel === 'host') {
      const queryArgs = { ...args };

      // Drill down safely to attach filters
      if (!isObject(queryArgs.include)) queryArgs.include = {};
      if (!isObject(queryArgs.include.event)) queryArgs.include.event = {};
      if (!isObject(queryArgs.include.event.include)) queryArgs.include.event.include = {};
      if (!isObject(queryArgs.include.event.include.attendees))
        queryArgs.include.event.include.attendees = {};
      if (!isObject(queryArgs.include.event.include.attendees.where))
        queryArgs.include.event.include.attendees.where = {};

      // Filter attendees
      queryArgs.include.event.include.attendees.where = {
        ...queryArgs.include.event.include.attendees.where,
        isDeleted: false,
        status: 'GOING',
      };

      const hosts = (await (prisma[this.prismaModel] as typeof prisma.host).findMany(
        queryArgs
      )) as HostWithEventAndAttendees[];

      // Deduplicate hosts by eventId
      const uniqueHosts = Array.from(new Map(hosts.map((h) => [h.eventId, h])).values());
      const total = uniqueHosts.length;

      // Sort in memory
      const sortedHosts = [...uniqueHosts].sort((a, b) => {
        const countA = a.event?.attendees?.length ?? 0;
        const countB = b.event?.attendees?.length ?? 0;
        return sortOrder === 'asc' ? countA - countB : countB - countA;
      });

      const skip = (page - 1) * limit;
      const paginatedHosts = sortedHosts.slice(skip, skip + limit);

      return {
        data: paginatedHosts as Prisma.Result<PrismaClient[T], 'findMany', K>,
        metadata: { total, page, limit, hasMore: skip + paginatedHosts.length < total },
      };
    }

    // 3. Standard DB Pagination
    const skip = (page - 1) * limit;
    const take = parseInt(limit.toString(), 10);
    let orderBy: any = { [sortBy]: sortOrder };

    // Remap host sorting to event startTime
    if (this.prismaModel === 'host' && sortBy === 'startTime') {
      orderBy = { event: { startTime: sortOrder } };
    }

    // Handle Distinct logic manually (DB count ignores distinct)
    if (this.prismaModel === 'host' && (args as any).distinct) {
      const allItems = await (prisma[this.prismaModel] as any).findMany({ ...args, orderBy });
      const uniqueItems = Array.from(new Map(allItems.map((i: any) => [i.eventId, i])).values());

      const total = uniqueItems.length;
      const paginatedItems = uniqueItems.slice(skip, skip + take);

      return {
        data: paginatedItems as any,
        metadata: { total, page, limit, hasMore: skip + paginatedItems.length < total },
      };
    }

    const [total, items] = await Promise.all([
      (prisma[this.prismaModel] as any).count({ where: args.where }),
      (prisma[this.prismaModel] as any).findMany({ ...args, skip, take, orderBy }),
    ]);

    return {
      data: items,
      metadata: { total, page, limit, hasMore: skip + items.length < total },
    };
  }
}
