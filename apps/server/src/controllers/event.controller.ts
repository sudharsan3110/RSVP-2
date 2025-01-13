import config from '@/config/config';
import { Attendees } from '@/db/models/attendees';
import { Events } from '@/db/models/events';
import { Users } from '@/db/models/users';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import catchAsync from '@/utils/catchAsync';
import { sluggify } from '@/utils/function';
import EmailService from '@/utils/sendEmail';
import { CohostRepository } from '@/db/models/cohost';
import {
  attendeePayloadSchema,
  verifyQrTokenPayloadSchema,
} from '@/validations/attendee.validation';
import { CreateEventSchema, eventsPlannedByUserReqSchema } from '@/validations/event.validation';
import { createHash, randomUUID } from 'crypto';
import z from 'zod';

type createEventBody = z.infer<typeof CreateEventSchema>;
type CreateAttendeeBody = z.infer<typeof attendeePayloadSchema>;
type verifyQrTokenPayloadBody = z.infer<typeof verifyQrTokenPayloadSchema>;

export const getEventBySlug = catchAsync(
  async (req: AuthenticatedRequest<{ slug?: string }, {}, {}>, res) => {
    const { slug } = req.params;

    const event = await Events.findUnique({ slug });

    if (!event) return res.status(404).json({ message: 'Event not found' });

    const totalAttendees = await Attendees.countAttendees(event.id);

    return res.status(200).json({ event, totalAttendees });
  }
);

export const getEventById = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;

    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    const event = await Events.findById(eventId);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    const totalAttendees = await Attendees.countAttendees(event.id);

    return res.status(200).json({ event, totalAttendees });
  }
);

export const allPlannedEvents = catchAsync(async (req, res) => {
  const getEventsData = await Events.findAllEvents();
  if (getEventsData.length != 0) {
    return res.status(200).json({ message: 'All Events Data', data: getEventsData });
  } else {
    return res.status(200).json({ data: [] });
  }
});

export const filterEvents = catchAsync(async (req, res) => {
  try {
    const { category, startDate, endDate, location, attendees } = req.query;

    if (!category && !startDate && !endDate && !location && !attendees) {
      return res
        .status(400)
        .json({ message: 'Please provide at least one query parameter to filter events.' });
    }

    const filters: any = {};
    let getEventsData: any = [];

    if (category) {
      getEventsData = await Events.filterByCategory(category as string);
    } else if (startDate && endDate) {
      getEventsData = await Events.filterByDate(startDate as string, endDate as string);
    } else if (location) {
      getEventsData = await Events.filterByLocation(location as string);
    } else if (attendees) {
      getEventsData = await Events.filterByAttendes();
    }

    return res.status(200).json({ message: 'All Events Data', data: getEventsData });
  } catch (e: any) {
    return res.status(502).json({
      message: 'There was an error processing your request.',
      reason: e.message || e,
    });
  }
});

export const createEvent = catchAsync(
  async (req: AuthenticatedRequest<{}, {}, createEventBody>, res) => {
    const data = req.body;

    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    const getUserData = await Users.findById(userId);

    if (!getUserData) return res.status(404).json({ message: 'User not found' });
    if (!getUserData.is_completed)
      return res
        .status(400)
        .json({ message: 'Please complete your profile before creating event' });

    const formattedData = {
      ...data,
      creatorId: userId,
      slug: sluggify(data.name),
    };

    console.log(formattedData);

    const newEvent = await Events.create(formattedData);

    await CohostRepository.addHost(userId, newEvent.id, 'Creator');

    return res.status(201).json({ message: 'success', event: newEvent });
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
  const { search, category, fromDate, toDate, venueType, page, limit, sortBy, sortOrder } =
    eventsPlannedByUserReqSchema.parse(req.query);

  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });
  const existingUser = await Users.findById(userId);

  if (existingUser) {
    const plannedEvents = await Events.plannedEvents({
      filters: {
        userId,
        search,
        category,
        fromDate,
        toDate,
        venueType,
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
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await Users.findById(userId);
    if (!user || !user.is_completed) {
      return res.status(400).json({ message: 'User profile is not completed' });
    }

    const eventId = req.params.eventId;
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    const event = await Events.findById(eventId as string);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isActive) {
      return res.status(400).json({ message: 'Event is not active' });
    }

    const currentTime = new Date();
    if (event.endTime < currentTime) {
      return res.status(400).json({ message: 'Event has expired' });
    }

    const existingAttendee = await Attendees.findByUserIdAndEventId(userId, eventId);
    if (existingAttendee) {
      const deleted_user = existingAttendee.deleted;
      if (deleted_user) {
        await Attendees.restoreAttendee(existingAttendee.id);
        return res.status(200).json({ message: 'Attendee restored successfully' });
      }
      return res.status(400).json({ message: 'User already registered for this event' });
    }

    const uuid = randomUUID();
    const hash = createHash('sha256').update(uuid).digest('base64');
    const qrToken = hash.slice(0, 6);

    const attendeeData = {
      qrToken: qrToken,
      userId: req.userId,
      eventId: eventId,
      ...req.body,
    };

    const newAttendee = await Attendees.create(attendeeData);
    const url = `${config.CLIENT_URL}/generateQr/${newAttendee.eventId}/${newAttendee.userId}`;
    console.log('URL to be sent via email:', url);

    await EmailService.send({
      id: 5,
      subject: 'Event Registration Confirmation',
      recipient: user.primary_email,
      body: {
        email: user.primary_email,
        qrLink: url,
      },
    });

    return res.status(201).json(newAttendee);
  }
);

export const getAttendeeDetails = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string; userId?: string }, {}, {}>, res) => {
    const userId = req.params.userId;
    const eventId = req.params.eventId;

    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    const attendee = await Attendees.findByUserIdAndEventId(userId, eventId);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    if (attendee.userId.toString() === userId?.toString()) {
      const deleted_user = attendee.deleted;
      if (deleted_user) {
        return res.status(400).json({ message: 'Attendee has been deleted' });
      }
      return res.status(200).json(attendee);
    }

    const hasAccess = await CohostRepository.checkHostForEvent(userId, attendee.eventId);
    if (hasAccess) {
      return res.status(200).json(attendee);
    }

    return res.status(403).json({ message: 'Unauthorized access' });
  }
);

export const getAttendeeByQrToken = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string; qrToken?: string }, {}, {}>, res) => {
    const { eventId, qrToken } = req.params;

    if (!qrToken) return res.status(400).json({ message: 'QR Token is required' });

    const attendee = await Attendees.findByQrToken(qrToken);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    if (attendee.eventId !== eventId) {
      return res.status(400).json({ message: 'Invalid event ID for this QR token' });
    }
    return res.status(200).json(attendee);
  }
);

export const verifyQrToken = catchAsync(
  async (req: AuthenticatedRequest<{}, {}, verifyQrTokenPayloadBody>, res, next) => {
    const userId = req.userId;
    const { qrToken, eventId } = req.body;

    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    const attendee = await Attendees.findByQrToken(qrToken);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    const deleted_user = attendee.deleted;
    if (deleted_user) {
      return res.status(400).json({ message: 'Attendee has been deleted' });
    }

    if (attendee.eventId !== eventId) {
      return res.status(400).json({ message: 'Not verified (wrong event)' });
    }

    if (!attendee.allowedStatus) {
      return res.status(403).json({ message: 'Attendee is not allowed' });
    }

    if (attendee.hasAttended) {
      return res.status(400).json({ message: 'Already scanned ticket' });
    }

    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const currentTime = new Date();

    if (currentTime < new Date(event.startTime) || currentTime > new Date(event.endTime)) {
      return res.status(400).json({ message: 'Ticket not valid at this time' });
    }

    await Attendees.update(attendee.id, {
      hasAttended: true,
      checkInTime: currentTime,
    });

    return res.status(200).json({ message: 'Ticket is valid' });
  }
);

export const softDeleteAttendee = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    const attendee = await Attendees.findByUserIdAndEventId(userId, eventId);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee record not found' });
    }

    if (attendee.deleted) {
      return res.status(400).json({ message: 'Attendee already deleted' });
    }

    if (attendee.userId.toString() === userId?.toString()) {
      await Attendees.softDelete(attendee.id);
      return res.status(200).json({
        message: 'Attendee removed successfully',
      });
    }

    const isCreator = await CohostRepository.checkCreatorForEvent(userId, attendee.eventId);
    if (isCreator) {
      await Attendees.softDelete(attendee.id);
      return res.status(200).json({
        message: 'Attendee removed successfully',
      });
    }

    return res.status(403).json({ message: 'Unauthorized access' });
  }
);
