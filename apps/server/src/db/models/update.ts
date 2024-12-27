import { IUpdate } from '@/interface/update';
import { prisma } from '../connection';

export class Update {
  static async create(notificationDetails: IUpdate) {
    if (!notificationDetails.userId || !notificationDetails.eventId) {
      throw new Error('userId and eventId are required');
    }

    const newNotification = await prisma.update.create({
      data: {
        content: notificationDetails.content,
        isNotification: notificationDetails.isNotification,
        scheduledNotificationTime: notificationDetails.scheduledNotificationTime,
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

  static async findById(eventId: string) {
    const event = await prisma.update.findMany({
      where: { eventId },
    });
    console.log('event details:', event);
    return event;
  }
}
