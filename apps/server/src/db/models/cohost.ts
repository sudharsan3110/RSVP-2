import { prisma } from '../connection';
import { Cohost, Role, Prisma } from '@prisma/client';

export class CohostRepository {
  static async findById(id: string): Promise<Cohost | null> {
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
            primary_email: true,
          },
        },
      },
    });
  }
  static async getHosts(eventId: string): Promise<Cohost[]> {
    return await prisma.cohost.findMany({
      where: { eventId },
      include: { user: true },
    });
  }

  static async create(data: Prisma.CohostCreateManyInput): Promise<Cohost> {
    return await prisma.cohost.create({
      data,
    });
  }

  static async addHost(
    userId: string,
    eventId: string,
    role: Role = Role.ReadOnly
  ): Promise<Cohost> {
    return await prisma.cohost.create({
      data: {
        userId,
        eventId,
        role,
      },
    });
  }

  static async update(id: string, data: Prisma.CohostUpdateInput): Promise<Cohost> {
    return await prisma.cohost.update({
      where: { id },
      data,
    });
  }

  static async removeHost(userId: string, eventId: string): Promise<boolean> {
    const deletedCohost = await prisma.cohost.deleteMany({
      where: { userId, eventId },
    });

    return deletedCohost.count > 0; // if any of the records are deleted return true
  }

  static async delete(id: string): Promise<Cohost> {
    return await prisma.cohost.delete({
      where: { id },
    });
  }

  static async findByUserIdAndEventId(userId: string, eventId: string): Promise<Cohost | null> {
    return await prisma.cohost.findFirst({
      where: {
        userId,
        eventId,
      },
    });
  }

  static async checkHostForEvent(
    userId: string,
    eventId: string,
    roles: Role[] = [Role.Creator, Role.Manager]
  ): Promise<boolean> {
    const cohost = await prisma.cohost.findFirst({
      where: {
        userId,
        eventId,
        role: {
          in: roles,
        },
      },
    });
    return cohost !== null;
  }

  static async checkCreatorForEvent(userId: string, eventId: string): Promise<boolean> {
    const creator = await prisma.cohost.findFirst({
      where: {
        userId,
        eventId,
        role: Role.Creator,
      },
    });
    return creator !== null;
  }

  static async hasRole(userId: string, eventId: string, role: Role): Promise<boolean> {
    const cohost = await prisma.cohost.findFirst({
      where: {
        userId,
        eventId,
      },
      select: {
        role: true,
      },
    });
    if (!cohost) {
      return false;
    }

    return cohost.role === role;
  }
}
