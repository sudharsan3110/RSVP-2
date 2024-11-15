import { Events } from '@/db/models/events';
import { Users } from '@/db/models/users';
import { Attendees } from '@/db/models/attendees';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import catchAsync from '@/utils/catchAsync';
import config from '@/config/config';
import { CreateEventSchema } from '@/validations/event.validation';
import { attendeePayloadSchema } from '@/validations/attendee.validation';
import { generateQrToken } from '@/utils/qrTokenService';
import z from 'zod';

type createEventBody = z.infer<typeof CreateEventSchema>;
type CreateAttendeeBody = z.infer<typeof attendeePayloadSchema>;

export const createEvent = catchAsync(
  async (req: AuthenticatedRequest<{}, {}, createEventBody>, res) => {
    const data = req.body;

    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    const getUserData = await Users.findById(userId);

    if (getUserData?.is_completed) {
      const formattedData = {
        ...data,
        creatorId: userId,
      };

      console.log(formattedData);

      const newEvent = await Events.create(formattedData);

      return res.status(201).json({ message: 'success', event: newEvent });
    } else {
      return res
        .status(400)
        .json({ message: 'Please complete your profile before creating event' });
    }
  }
);

export const createAttendee = catchAsync(
  async (req: AuthenticatedRequest<{ eventId: string }, {}, CreateAttendeeBody>, res, next) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      const user = await Users.findById(req.userId);
      if (!user || !user.is_completed) {
        return res.status(400).json({ message: 'User profile is not completed' });
      }

      const eventId = req.params.eventId;
      const event = await Events.findById(eventId as string);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const qrData = {
        userId: req.userId,
        userName: user.full_name,
        eventId: event.id,
        eventName: event.name,
        expirationTime: event.endTime,
      };

      const qrToken = generateQrToken(qrData);

      const existingAttendee = await Attendees.findByQrToken(qrToken);
      if (existingAttendee) {
        return res.status(400).json({ message: 'QR Token already exists' });
      }

      const attendeeData = {
        qrToken: qrToken,
        userId: req.userId,
        eventId: eventId,
        ...req.body,
      };

      const newAttendee = await Attendees.create(attendeeData);
      const url = `${config.CLIENT_URL}/generateQr/${newAttendee.id}`;
      console.log('URL to be sent via email:', url);

      return res.status(201).json(newAttendee);
    } catch (error) {
      console.error('Error creating attendee:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);
