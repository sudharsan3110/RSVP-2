import z from 'zod';
import { Events } from '@/db/models/events';
import { Update } from '@/db/models/update';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { userUpdateSchema } from '@/validations/event.validation';
import catchAsync from '@/utils/catchAsync';
import generatePresignedUrl from '@/utils/s3';
import { Users } from '@/db/models/users';
import { Attendees } from '@/db/models/attendees';
import EmailService from '@/utils/sendEmail';

type createNotificationBody = z.infer<typeof userUpdateSchema>;

export const createNotification = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, createNotificationBody>, res) => {
    const data = req.body;
    const param = req.params;
    const RSVP_SUBJECT_MSG = 'Updates from your event';

    const event = await Events.findById(param.eventId as string);
    // console.log('event details:', event);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const getUserDetails = await Users.findById(event.creatorId);

    // console.log('user exists', getUserDetails);

    if (!getUserDetails?.id) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notificationData = {
      content: data.content,
      eventId: param.eventId as string,
      isNotification: true,
      scheduledNotificationTime: new Date(),
      userId: getUserDetails.id,
    };

    const newNotification = await Update.create(notificationData);

    const notificationDeta = {
      ...newNotification,
      user: {
        id: getUserDetails.id,
        name: getUserDetails?.full_name,
        email: getUserDetails?.primary_email,
      },
    };

    const attendeeList = await Attendees.findByEventId(param.eventId as string);

    const attendeeIds = attendeeList
      .filter((attendee) => attendee.userId !== notificationDeta.user.id)
      .map((user) => String(user.userId));

    const usersList = await Users.findAllByIds(attendeeIds);

    let emailData = {
      id: 6,
      subject: RSVP_SUBJECT_MSG,
      recipient: notificationDeta.user.email,
      body: {
        eventName: event.name,
        updatesText: notificationDeta.content,
        updatesLink: `https://www.rsvp.kim/v1/event/${notificationDeta.eventId}/communication`,
      },
      bcc: usersList.map((user) => user.primary_email),
    };

    const emailResponse = await EmailService.send(emailData);
    if (emailResponse.status === 200) {
      console.log(JSON.stringify(emailResponse.data));
    } else {
      console.log(emailResponse);
    }

    return res.status(201).json(notificationDeta);
  }
);

export const uploadEventImage = catchAsync(async (req: AuthenticatedRequest<{}, {}, {}>, res) => {
  const fileName = req.query.filename;
  const response = await generatePresignedUrl(fileName as string);
  return res.status(200).json(response);
});

export const getNotification = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}>, res) => {
    const param = req.params;

    const event = await Events.findById(param.eventId as string);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const notifications = await Update.findById(param.eventId as string);

    console.log('notifications', notifications);

    // if (!notifications || notifications.length === 0) {
    //   return res.status(200).json({notifications:[]});
    // }

    // const getUserDetails = await Users.findById(event.creatorId);

    // if (!getUserDetails?.id) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    // const eventNotifications = notifications.map((notification) => ({
    //   ...notification,
    //   user: {
    //     id: getUserDetails.id,
    //     name: getUserDetails.full_name,
    //     email: getUserDetails.primary_email,
    //   },
    // }));

    // console.log('notifications', eventNotifications);

    return res.status(200).json(notifications);
  }
);
