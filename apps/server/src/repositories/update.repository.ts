import { IUpdate } from '@/interface/update';
import { prisma } from '@/utils/connection';

/**
 * UpdateRepository class provides methods to interact with the Updates table in the database.
 * It includes methods for retrieving and creating updates related to events.
 */
export class UpdateRepository {
  /**
   * Retrieves all updates for a specific event.
   * @param eventId - The unique ID of the event.
   * @returns An array of updates associated with the event, including user details.
   */
  static async findAllById(eventId: string) {
    const events = await prisma.chat.findMany({
      where: { eventId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileIcon: true,
            userName: true,
          },
        },
      },
    });
    return events;
  }

  /**
   * Creates a new update or notification for an event.
   * @param notificationDetails - The details of the update or notification to be created.
   * @returns The newly created update object.
   */
  static async create(notificationDetails: IUpdate) {
    const newNotification = await prisma.chat.create({
      data: {
        content: notificationDetails.content,
        isNotification: notificationDetails.isNotification,
        event: {
          connect: {
            id: notificationDetails.eventId,
          },
        },
        user: {
          connect: {
            id: notificationDetails.userId,
          },
        },
      },
    });
    return newNotification;
  }
}
