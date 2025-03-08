import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const prisma = new PrismaClient();

interface EmailData {
  id: number;
  subject: string;
  body: Record<string, string>;
}

class EmailService {
  private static emailUrl = process.env.STATIC_EMAIL_URL;

  static async send(emailData: EmailData): Promise<any> {
    try {
      const response = await axios.post(this.emailUrl!, emailData, {
        headers: {
          Authorization: `${process.env.EMAIL_TOKEN}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
    }
  }
}

async function processEventNotifications() {
  let currentTime = new Date();
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
      Attendee: {
        some: {
          hasAttended: false,
          status: 'Going',
          allowedStatus: true,
          deleted: false,
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      startTime: true,
      Attendee: {
        where: {
          hasAttended: false,
          status: 'Going',
          allowedStatus: true,
          deleted: false,
        },
        select: {
          id: true,
          user: {
            select: {
              full_name: true,
              primary_email: true,
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
        updatesLink: `https://www.rsvp.kim/${event.slug}`,
      },
      bcc: event.Attendee.map(
        (attendee: { user: { primary_email: string } }) => attendee.user.primary_email
      ),
    };
    return EmailService.send(eventEmailData);
  });

  await Promise.all(emailPromises);
}

processEventNotifications()
  .then(() => {
    console.log(`Events Notification Sent Successfully at ${new Date()}`);
  })
  .catch((error) => {
    console.error('Some Error Occurred while sending Event Notification!', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
