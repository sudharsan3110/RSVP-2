import { IPaginationParams, IPaginatedResult } from '@/interface/pagination';
import { prisma } from '@/db/connection';
import { Prisma, PrismaClient } from '@prisma/client';

export class Paginator<T extends keyof PrismaClient> {
  constructor(private readonly prismaModel: T) {}

  async paginate<K extends Prisma.Args<PrismaClient[T], 'findMany'>>(
    params: IPaginationParams,
    args: K = {} as K
  ): Promise<IPaginatedResult<Prisma.Result<PrismaClient[T], 'findMany', K>>> {
    const { page = 1, limit = 10, sortBy = 'eventDate', sortOrder = 'desc' } = params;

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
