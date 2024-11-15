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

  static async findByQrToken(qrToken: string) {
    return await prisma.attendee.findUnique({
      where: { qrToken },
    });
  }
}
