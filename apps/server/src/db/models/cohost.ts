import { prisma } from '../connection';
import { Cohost, Role } from '@prisma/client';

export class CohostRepository {
  static async getHosts(eventId: string): Promise<Cohost[]> {
    return await prisma.cohost.findMany({
      where: { eventId },
      include: { user: true },
    });
  }

  static async addHost(
    userId: number,
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

  static async removeHost(userId: number, eventId: string): Promise<Cohost> {
    return await prisma.cohost.delete({
      where: { userId },
    });
  }

  static async checkHostForEvent(userId: number, eventId: string): Promise<boolean> {
    const cohost = await prisma.cohost.findFirst({
      where: {
        userId,
        eventId,
      },
    });
    return cohost !== null;
  }

  static async checkCreatorForEvent(userId: number, eventId: string): Promise<boolean> {
    const creator = await prisma.cohost.findFirst({
      where: {
        userId,
        eventId,
        role: Role.Creator,
      },
    });
    return creator !== null;
  }
}
