import { prisma } from '@/utils/connection';
import { HostRole } from '@prisma/client';

export class StatRepository {
  /**
   * Retrieves the total count of active users in the system.
   * Excludes users that have been soft-deleted.
   * @returns A promise resolving to the number of active users.
   */
  static async getTotalUsersCount(): Promise<number> {
    return await prisma.user.count({
      where: {
        isDeleted: false,
      },
    });
  }

  /**
   * Retrieves system-wide host statistics.
   * @returns A promise resolving to the number of active hosts.
   */
  static async getHostStatusCounts(): Promise<number> {
    return await prisma.host.count({ where: { isDeleted: false, role: HostRole.CREATOR } });
  }

  /**
   * Retrieves system-wide event statistics.
   * @returns An object containing counts for each event status.
   */
  static async getEventStatusCounts() {
    const now = new Date();

    const [totalEvents, upcomingEvents, ongoingEvents, completedEvents, usedTickets, totalTickets] =
      await Promise.all([
        prisma.event.count({
          where: {
            isDeleted: false,
          },
        }),
        prisma.event.count({
          where: {
            isDeleted: false,
            isActive: true,
            startTime: { gt: now },
          },
        }),
        prisma.event.count({
          where: {
            isDeleted: false,
            isActive: true,
            startTime: { lte: now },
            endTime: { gte: now },
          },
        }),
        prisma.event.count({
          where: {
            isDeleted: false,
            isActive: true,
            endTime: { lt: now },
          },
        }),
        prisma.attendee.count({ where: { status: 'GOING', isDeleted: false } }),
        prisma.event.aggregate({
          _sum: {
            capacity: true,
          },
          where: {
            isActive: true,
            isDeleted: false,
          },
        }),
      ]);

    return {
      totalEvents,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalTickets: totalTickets._sum.capacity || 0,
      usedTickets,
    };
  }
}
