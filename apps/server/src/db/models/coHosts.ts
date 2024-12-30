import { prisma } from '../connection';
import { Prisma } from '@prisma/client';

export class Cohosts {
  static async findById(id: string) {
    return await prisma.cohost.findUnique({
      where: { id },
    });
  }

  static async findByEventId(eventId: string) {
    return await prisma.cohost.findMany({
      where: { eventId },
      select: {
        role: true,
        user: {
          select: {
            id: true,
            full_name: true,
            profile_icon: true,
          },
        },
      },
      // include: {
      //   user: {
      //     select: {
      //       full_name: true,
      //       profile_icon: true,
      //     },
      //   },
      // },
    });
  }

  static async create(data: Prisma.CohostCreateManyInput) {
    return prisma.cohost.create({ data });
  }

  static async delete(id: string) {
    return await prisma.cohost.delete({
      where: { id },
    });
  }

  static async update(id: string, data: any) {
    return await prisma.cohost.update({
      where: { id },
      data,
    });
  }

  static async findByUserIdAndEventId(userId: number, eventId: string) {
    return await prisma.cohost.findFirst({
      where: {
        userId,
        eventId,
      },
    });
  }
}
