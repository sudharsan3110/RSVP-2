import z from 'zod';
import { Events } from '@/db/models/events';
import { Update } from '@/db/models/update';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { userUpdateSchema } from '@/validations/event.validation';
import catchAsync from '@/utils/catchAsync';
import { Users } from '@/db/models/users';

type createNotificationBody = z.infer<typeof userUpdateSchema>;

export const createNotification = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, createNotificationBody>, res) => {
    const data = req.body;
    const param = req.params;

    const event = await Events.findById(param.eventId as string);
    console.log('event details:', event);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const getUserDetails = await Users.findById(event.creatorId);

    console.log('user exists', getUserDetails);

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
    return res.status(201).json(notificationDeta);
  }
);

export const getNotification = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}>, res) => {
    const param = req.params;

    const event = await Events.findById(param.eventId as string);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const notifications = await Update.findById(param.eventId as string);

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: 'No notifications found for this event' });
    }

    const getUserDetails = await Users.findById(event.creatorId);

    if (!getUserDetails?.id) {
      return res.status(404).json({ message: 'User not found' });
    }

    const eventNotifications = notifications.map((notification) => ({
      ...notification,
      user: {
        id: getUserDetails.id,
        name: getUserDetails.full_name,
        email: getUserDetails.primary_email,
      },
    }));

    console.log('notifications', eventNotifications);

    if (!notifications) {
      return res.status(404).json({ message: 'Notification not found' });
    } else {
      return res.status(200).json(eventNotifications);
    }
  }
);
