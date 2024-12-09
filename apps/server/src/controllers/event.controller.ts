import { Events } from '@/db/models/events';
import { Users } from '@/db/models/users';
import { Attendees } from '@/db/models/attendees';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { eventsPlannedByUserReqSchema } from '@/validations/event.validation';
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

export const updateEvent = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, createEventBody>, res) => {
    const eventId = req.params.eventId;
    const data = req.body;

    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    const updatedEvent = await Events.update(eventId, data);

    return res.status(200).json({ message: 'success', event: updatedEvent });
  }
);

export const deleteEvent = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const eventId = req.params.eventId;

    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    const event = await Events.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await Events.delete(eventId);

    return res.status(200).json({ message: 'success' });
  }
);

export const plannedByUser = catchAsync(async (req: AuthenticatedRequest<{}, {}, {}>, res) => {
  const { email, type, fromDate, toDate, search, page, limit, sortBy, sortOrder } =
    eventsPlannedByUserReqSchema.parse(req.query);

  const existingUser = await Users.userExists(email);

  if (existingUser) {
    const plannedEvents = await Events.plannedEvents({
      filters: {
        email,
        type,
        fromDate,
        toDate,
        search,
      },
      pagination: {
        page,
        limit,
        sortBy,
        sortOrder,
      },
    });
    res.status(200).json({ message: 'success', data: plannedEvents });
  } else {
    res.status(404).json({ message: 'user not found' });
  }
});

export const createAttendee = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, CreateAttendeeBody>, res) => {
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
