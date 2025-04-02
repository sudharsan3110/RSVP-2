import config from '@/config/config';
import { API_MESSAGES } from '@/constants/apiMessages';
import { Attendees } from '@/db/models/attendees';
import { CohostRepository } from '@/db/models/cohost';
import { Events } from '@/db/models/events';
import { Users } from '@/db/models/users';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import catchAsync from '@/utils/catchAsync';
import { sluggify } from '@/utils/function';
import logger from '@/utils/logger';
import EmailService from '@/utils/sendEmail';
import {
  attendeePayloadSchema,
  editSlugSchema,
  verifyQrTokenParamsSchema,
} from '@/validations/attendee.validation';
import {
  attendeesQuerySchema,
  CreateEventSchema,
  eventLimitSchema,
  eventsPlannedByUserReqSchema,
} from '@/validations/event.validation';
import { createHash, randomUUID } from 'crypto';
import * as XLSX from 'xlsx';
import z from 'zod';

type createEventBody = z.infer<typeof CreateEventSchema>;
type CreateAttendeeBody = z.infer<typeof attendeePayloadSchema>;
type verifyQrTokenParamsBody = z.infer<typeof verifyQrTokenParamsSchema>;

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

type EditEventSlugBpdy = z.infer<typeof editSlugSchema>;
export const editEventSlug = catchAsync(
  async (req: AuthenticatedRequest<{ id?: string }, {}, EditEventSlugBpdy>, res) => {
    const { id } = req.params;
    const { userId } = req;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    if (!id) return res.status(400).json({ message: 'Event ID is required' });

    const slug = req.body.slug;

    const updatedSlug = await Events.updateSlug(id, userId, slug);

    return res.status(200).json({ data: updatedSlug, success: true });
  }
);
export const getPopularEvents = catchAsync(async (req, res) => {
  const { limit } = eventLimitSchema.parse(req.query);
  const PopularEvents = await Events.getPopularEvents(limit);
  if (PopularEvents.length != 0) return res.status(200).json({ data: PopularEvents });
  else return res.status(200).json({ data: [] });
});

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
    const { category, sortBy, location, searchParam, page, limit, order } = req.query;
    const pageNumber = page && !isNaN(Number(page)) ? parseInt(page as string, 10) : 1;
    const limitNumber = limit && !isNaN(Number(limit)) ? parseInt(limit as string, 10) : 10;
    const events = await Events.findEvents({
      page: pageNumber,
      limit: limitNumber,
      category: category as string,
      sortby: sortBy as string,
      venueAddress: location as string,
      query: searchParam as string,
      order: order as 'asc' | 'desc',
    });

    const total_events = await Events.findAllEvents();
    const total_page = Math.ceil(total_events.length / limitNumber);
    const metadata = {
      page: pageNumber,
      page_count: total_page,
      current_page_count: events.length,
      links: {
        self: `/events?page=${pageNumber}&limit=${limitNumber}`,
        next:
          pageNumber < total_page ? `/events?page=${pageNumber + 1}&limit=${limitNumber}` : null,
        previous: pageNumber > 1 ? `/events?page=${pageNumber - 1}&limit=${limitNumber}` : null,
        first: `/events?page=1&limit=${limitNumber}`,
        last: `/events?page=${total_page}&limit=${limitNumber}`,
      },
    };

    return res.status(200).json({
      message: 'Filtered Events Data',
      data: events,
      metadata,
    });
  } catch (e: any) {
    return res.status(502).json({
      message: 'There was an error processing your request.',
      reason: e.message || e,
    });
  }
});

export const getUpcomingEventsByUser = catchAsync(
  async (req: AuthenticatedRequest<{}, {}, {}>, res) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const { startDate, endDate, page, limit } = req.query;

    const filters = {
      userId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    };

    const registeredEvents = await Attendees.findRegisteredEventsByUser(filters);

    return res.status(200).json({
      message: 'Registered events retrieved successfully',
      data: registeredEvents.events,
      metadata: registeredEvents.metadata,
    });
  }
);

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

export const cancelEvent = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    const { userId } = req;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    const cancelEvent = await Events.cancel(eventId, userId);

    return res.status(200).json({ data: cancelEvent, success: true });
  }
);

export const deleteEvent = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    const { userId } = req;
    
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.isDeleted) {
      return res.status(400).json({ message: 'Event already deleted' });
    }

    const deletedEvent = await Events.delete(eventId, userId);

    return res.status(200).json({ 
      data: deletedEvent, 
      message: 'Event deleted successfully',
      success: true 
    });
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
    res.status(404).json({ data: [] });
  }
});

// Attendee routes
export const createAttendee = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, CreateAttendeeBody>, res) => {
    let AttendeeStatus = {};
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

    if (!event.hostPermissionRequired) {
      AttendeeStatus = { allowedStatus: true, status: 'Going' };
    } else {
      AttendeeStatus = { allowedStatus: false, status: 'Waiting' };
    }

    const attendeeData = {
      qrToken: qrToken,
      userId: req.userId,
      eventId: eventId,
      ...AttendeeStatus,
    };

    const newAttendee = await Attendees.create(attendeeData);
    const url = `${config.CLIENT_URL}/generateQr/${newAttendee.eventId}/${newAttendee.userId}`;

    if (config.env !== 'development') {
      await EmailService.send({
        id: 5,
        subject: 'Event Registration Confirmation',
        recipient: user.primary_email,
        body: {
          email: user.primary_email,
          qrLink: url,
        },
      });
    }
    else{
      logger.info('URL to be sent via email:', url);
    }

    return res.status(201).json(newAttendee);
  }
);

export const getAttendees = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const eventId = req.params.eventId;
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    const pagination = await attendeesQuerySchema.parseAsync(req.query);
    const attendees = await Attendees.findAttendeesByEventId({ eventId, ...pagination });

    return res.status(200).json(attendees);
  }
);

export const getAttendeesExcelSheet = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const eventId = req.params.eventId;
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    const attendees = await Attendees.findAllAttendees(eventId);
    // Transform data for Excel export
    const exportData = attendees.map((attendee: any, index) => ({
      'Sr. No': index + 1,
      'Full Name': attendee.user.full_name,
      Email: attendee.user.primary_email,
      Contact: attendee.user.contact || '-',
      'Registration Time': new Date(attendee.registrationTime).toLocaleString(),
      Status: attendee.status,
      'Has Attended': attendee.hasAttended ? 'Yes' : 'No',
      'Check-in Time': attendee.checkInTime ? new Date(attendee.checkInTime).toLocaleString() : '-',
      Feedback: attendee.feedback || '-',
      'QR Token': attendee.qrToken,
      'Allowed Status': attendee.allowedStatus ? 'Yes' : 'No',
      'Last Updated': new Date(attendee.updatedAt).toLocaleString(),
    }));

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 36 }, // ID
      { wch: 10 }, // User ID
      { wch: 30 }, // Full Name
      { wch: 30 }, // Email
      { wch: 15 }, // Contact
      { wch: 20 }, // Registration Time
      { wch: 15 }, // Status
      { wch: 12 }, // Has Attended
      { wch: 20 }, // Check-in Time
      { wch: 40 }, // Feedback
      { wch: 10 }, // QR Token
      { wch: 15 }, // Allowed Status
      { wch: 20 }, // Last Updated
    ];
    worksheet['!cols'] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=attendees-${eventId}.xlsx`);

    // Send the file
    res.send(excelBuffer);
  }
);

export const getAttendeeDetails = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const userId = req.userId;
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

    return res.status(403).json({ message: 'Unauthorized access' });
  }
);

export const checkAllowStatus = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    const userId = req.userId;
    if (!eventId)
      return res.status(400).json({ message: API_MESSAGES.ALLOW_GUEST.EVENTID_REQUIRED });
    if (!userId) return res.status(401).json({ message: API_MESSAGES.ALLOW_GUEST.INVALID_TOKEN });

    return res.status(200).json({
      message: API_MESSAGES.ALLOW_GUEST.SUCCESS,
      data: { success: true },
    });
  }
);

interface AllowStatusRequestBody {
  allowedStatus: boolean;
  userId: string;
}

export const updateAttendeeAllowStatus = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, AllowStatusRequestBody>, res) => {
    const { eventId } = req.params;
    const { userId, allowedStatus } = req.body;

    if (!eventId)
      return res.status(400).json({ message: API_MESSAGES.ALLOW_GUEST.EVENTID_REQUIRED });

    const updatedAttendee = await Attendees.updateAllowStatus(eventId, userId, allowedStatus);

    return res.status(200).json({
      message: API_MESSAGES.ALLOW_GUEST.SUCCESSFUL_ATTENDEE_UPDATE,
      data: updatedAttendee,
    });
  }
);

export const getAttendeeByQrToken = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string; qrToken?: string }, {}, {}>, res) => {
    const { eventId, qrToken } = req.params;

    if (!qrToken) return res.status(400).json({ message: 'QR Token is required' });

    const attendee = await Attendees.findByQrToken(qrToken, eventId);
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    return res.status(200).json(attendee);
  }
);

export const verifyQrToken = catchAsync(
  async (
    req: AuthenticatedRequest<{ eventId?: string; attendeeId?: string }, {}, {}>,
    res,
    next
  ) => {
    const userId = req.userId;
    const { attendeeId, eventId } = req.params;
    if (!attendeeId || !eventId)
      return res.status(400).json({ message: 'Attendee ID and Event ID is required' });

    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    const attendee = await Attendees.findById(attendeeId);
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
    const eventStartTime = new Date(event.startTime);
    const eventEndTime = new Date(event.endTime);

    const verificationStartTime = new Date(eventStartTime);
    verificationStartTime.setHours(eventStartTime.getHours() - 1);

    if (currentTime < verificationStartTime) {
      return res.status(400).json({
        message: 'Ticket verification will start 1 hour before the event',
      });
    }

    if (currentTime > eventEndTime) {
      return res.status(400).json({
        message: 'Event has ended. Ticket is no longer valid',
      });
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
