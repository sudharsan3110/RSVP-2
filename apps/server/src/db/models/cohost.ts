import { prisma } from '../connection';
import { Cohost } from '@prisma/client';

export class CohostRepository {
  static async getHosts(eventId: string): Promise<Cohost[]> {
    return await prisma.cohost.findMany({
      where: { eventId },
      include: { user: true },
    });
  }

  static async addHost(userId: number, eventId: string): Promise<Cohost> {
    return await prisma.cohost.create({
      data: {
        userId,
        eventId,
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
}
