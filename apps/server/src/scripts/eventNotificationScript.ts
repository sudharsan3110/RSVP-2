import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import EmailService from '@/utils/sendEmail';
import config from '@/config/config';
import logger from '@/utils/logger';
import { formatToIST } from '@/utils/date';

dotenv.config();
const prisma = new PrismaClient();

async function processEventNotifications() {
  const runId = Date.now().toString(36);
  const t0 = Date.now();

  logger.info({ runId, phase: 'start', utc: new Date().toISOString() });

  try {
    const currentTime = new Date();
    const oneHourLaterFromCurrentTime = new Date(currentTime.getTime() + 3600000);

    const events = await prisma.event.findMany({
      where: {
        startTime: { gte: currentTime, lt: oneHourLaterFromCurrentTime },
        sendReminderEmail: false,
        isActive: true,
        isDeleted: false,
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
    const successfulEventIds: string[] = [];

    const emailPromises = events.map(async (event) => {
      const recipients = event.attendees
        .map((attendee) => attendee.user?.primaryEmail)
        .filter((e): e is string => !!e);

      if (!recipients.length) {
        logger.warn({ runId, phase: 'skip', eventId: event.id, reason: 'noRecipients' });
        return;
      }

      const startTimeIST = formatToIST(event.startTime);

      const eventEmailData = {
        id: 6,
        subject: `${event.name} Starts Soon!`,
        body: {
          eventName: event.name,
          updatesText: `Just a quick reminder that your event ${event.name} is starting soon at ${startTimeIST}`,
          updatesLink: `${config.CLIENT_URL}/${event.slug}`,
        },
        bcc: recipients,
      };

      try {
        await EmailService.send(eventEmailData);
        successfulEventIds.push(event.id);
        sent += recipients.length;
        logger.info({ runId, phase: 'sent', eventId: event.id, recipients });
      } catch (err: any) {
        failed += recipients.length;
        logger.error({ runId, phase: 'fail', eventId: event.id, msg: err.message });
      }
    });

    await Promise.all(emailPromises);

    if (successfulEventIds.length > 0) {
      await prisma.event.updateMany({
        where: { id: { in: successfulEventIds } },
        data: { sendReminderEmail: true },
      });
    }

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
