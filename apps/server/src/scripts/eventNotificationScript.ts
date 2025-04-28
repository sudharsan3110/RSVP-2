import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import EmailService from '@/utils/sendEmail';
import config from '@/config/config';

dotenv.config();
const prisma = new PrismaClient();

async function processEventNotifications() {
  try {
    const currentTime = new Date();
    currentTime.setMinutes(0, 0, 0);

    const oneHourLaterFromCurrentTime = new Date(currentTime.getTime() + 3600000);
    const twoHoursLaterFromCurrentTime = new Date(currentTime.getTime() + 7200000);
    const twentyFourHoursLaterFromCurrentTime = new Date(currentTime.getTime() + 86400000);
    const twentyFiveHoursLaterFromCurrentTime = new Date(currentTime.getTime() + 90000000);

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { startTime: { gte: oneHourLaterFromCurrentTime, lt: twoHoursLaterFromCurrentTime } },
          {
            startTime: {
              gte: twentyFourHoursLaterFromCurrentTime,
              lt: twentyFiveHoursLaterFromCurrentTime,
            },
          },
        ],
        attendees: {
          some: {
            hasAttended: false,
            status: 'GOING',
            allowedStatus: true,
            isDeleted: false,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        startTime: true,
        attendees: {
          where: {
            hasAttended: false,
            status: 'GOING',
            allowedStatus: true,
            isDeleted: false,
          },
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                primaryEmail: true,
              },
            },
          },
        },
      },
    });

    const emailPromises = events.map(async (event) => {
      const eventEmailData = {
        id: 6,
        subject: `Your Event ${event.name} Starts Soon!`,
        body: {
          eventName: event.name,
          updatesText: `Just a quick reminder that your event ${event.name} is starting soon at ${event.startTime}`,
          updatesLink: `${config.CLIENT_URL}/${event.slug}`,
        },
        bcc: event.attendees.map(
          (attendee: { user: { primaryEmail: string } }) => attendee.user.primaryEmail
        ),
      };
      return EmailService.send(eventEmailData);
    });

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('Failed to process event notifications:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default processEventNotifications;
