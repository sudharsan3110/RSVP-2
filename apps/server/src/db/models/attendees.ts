import { prisma } from '../connection';

export class Attendees {
  static async findById(id: string) {
    return await prisma.attendee.findUnique({
      where: { id },
    });
  }

  static async create(data: any) {
    return await prisma.attendee.create({
      data,
    });
  }

  static async delete(id: string) {
    return await prisma.attendee.delete({
      where: { id },
    });
  }

  static async update(id: string, data: any) {
    return await prisma.attendee.update({
      where: { id },
      data,
    });
  }

  static async findByQrToken(qrToken: string) {
    return await prisma.attendee.findUnique({
      where: { qrToken },
    });
  }

  static async findByUserIdAndEventId(userId: number, eventId: string) {
    return await prisma.attendee.findFirst({
      where: {
        userId,
        eventId,
      },
    });
  }

  static async countAttendees(eventId: string) {
    return await prisma.attendee.count({ where: { eventId } });
  }
}
