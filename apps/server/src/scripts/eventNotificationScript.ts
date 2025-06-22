import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import EmailService from '@/utils/sendEmail';
import config from '@/config/config';
import logger from '@/utils/logger';

dotenv.config();
const prisma = new PrismaClient();

async function processEventNotifications() {
  const runId = Date.now().toString(36);
  const t0 = Date.now();

  logger.info({ runId, phase: 'start', utc: new Date().toISOString() });

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

    logger.info({ runId, phase: 'query', events: events.length });

    let sent = 0;
    let failed = 0;

    const emailPromises = events.map(async (event) => {
      const recipients = event.attendees
        .map((attendee) => attendee.user?.primaryEmail)
        .filter((e): e is string => !!e);

      if (!recipients.length) {
        logger.warn({ runId, phase: 'skip', eventId: event.id, reason: 'noRecipients' });
        return;
      }

      const eventEmailData = {
        id: 6,
        subject: `${event.name} Starts Soon!`,
        body: {
          eventName: event.name,
          updatesText: `Just a quick reminder that your event ${event.name} is starting soon at ${event.startTime}`,
          updatesLink: `${config.CLIENT_URL}/${event.slug}`,
        },
        bcc: recipients
      };

      try {
        await EmailService.send(eventEmailData);
        sent += recipients.length;
        logger.info({ runId, phase: 'sent', eventId: event.id, recipients });
      } catch (err: any) {
        failed += recipients.length;
        logger.error({ runId, phase: 'fail', eventId: event.id, msg: err.message });
      }
    });

    await Promise.all(emailPromises);

    logger.info({
      runId,
      phase: 'end',
      sent,
      failed,
      ms: Date.now() - t0,
    });
  } catch (error: any) {
    logger.error({ runId, phase: 'fatal', msg: error.message });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default processEventNotifications;
