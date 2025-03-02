import { IPaginationParams } from '@/interface/pagination';
import { Paginator } from '@/utils/pagination';
import { Attendee, Prisma } from '@prisma/client';
import { prisma } from '../connection';
import { API_MESSAGES } from '@/constants/apiMessages';
interface AttendeesByEvent extends IPaginationParams {
  eventId: string;
  hasAttended?: boolean;
}
export class Attendees {
  static attendeePaginator = new Paginator('attendee');
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

  static async softDelete(id: string) {
    return await prisma.attendee.update({
      where: { id },
      data: {
        deleted: true,
      },
    });
  }

  static async restoreAttendee(id: string) {
    return await prisma.attendee.update({
      where: { id },
      data: {
        deleted: false,
      },
    });
  }

  static async update(id: string, data: any) {
    return await prisma.attendee.update({
      where: { id },
      data,
    });
  }

  static async findByQrToken(qrToken: string, eventId?: string) {
    return await prisma.attendee.findUnique({
      where: { qrToken, eventId },
      include: {
        user: {
          select: {
            full_name: true,
            primary_email: true,
            contact: true,
          },
        },
      },
    });
  }

  static async findByUserIdAndEventId(userId: string, eventId: string) {
    return await prisma.attendee.findFirst({
      where: {
        userId,
        eventId,
      },
    });
  }

  static async findByEventId(eventId: string) {
    return await prisma.attendee.findMany({
      where: { eventId },
    });
  }

  static async countAttendees(eventId: string) {
    return await prisma.attendee.count({ where: { eventId, status: 'Going' } });
  }

  static async findAttendeesByEventId({
    eventId,
    hasAttended,
    page = 1,
    limit = 10,
    sortBy = 'registrationTime',
    sortOrder = 'desc',
    search,
  }: AttendeesByEvent) {
    const whereClause: Prisma.AttendeeWhereInput = {
      eventId,
      user: search
        ? {
            OR: [
              {
                full_name: {
                  contains: search,
                },
              },
              {
                primary_email: {
                  contains: search,
                },
              },
              {
                secondary_email: {
                  contains: search,
                },
              },
            ],
          }
        : undefined,
      hasAttended: hasAttended,
    };

    return await this.attendeePaginator.paginate(
      { page, limit, sortBy, sortOrder },
      { where: whereClause, include: { user: true } }
    );
  }

  static async findAllAttendees(eventId: string): Promise<Attendee[]> {
    const attendees = await prisma.attendee.findMany({
      where: {
        eventId,
        deleted: false,
      },
      include: {
        user: {
          select: {
            full_name: true,
            primary_email: true,
            contact: true,
          },
        },
      },
    });

    return attendees;
  }

  static async updateAllowStatus(eventId: string, userId: string, allowedStatus: boolean) {
    const attendee = await prisma.attendee.findFirst({
      where: {
        eventId,
        userId,
        deleted: false,
      },
    });

    if (!attendee) {
      throw new Error(API_MESSAGES.ALLOW_GUEST.ATTENDEE_NOT_FOUND);
    }

    return await prisma.attendee.update({
      where: {
        id: attendee.id,
      },
      data: {
        allowedStatus,
      },
    });
  }
}
