import config from '@/config/config';
import { API_MESSAGES } from '@/constants/apiMessages';
import { AttendeeRepository } from '@/repositories/attendee.repository';
import { CohostRepository } from '@/repositories/cohost.repository';
import { EventRepository } from '@/repositories/event.repository';
import { UserRepository } from '@/repositories/user.repository';
import catchAsync from '@/utils/catchAsync';
import { sluggify } from '@/utils/function';
import logger from '@/utils/logger';
import EmailService from '@/utils/sendEmail';
import {
  attendeePayloadSchema,
  editSlugSchema,
  UpcomingEventsQuery,
  upcomingEventsQuerySchema,
} from '@/validations/attendee.validation';
import {
  attendeesQuerySchema,
  CreateEventSchema,
  EventFilter,
  eventFilterSchema,
  eventLimitSchema,
  eventsPlannedByUserReqSchema,
} from '@/validations/event.validation';
import { Attendee, Prisma, Status, VenueType } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';
import { IAllowStatus } from '@/interface/event';
import * as XLSX from 'xlsx';
import z from 'zod';
import { IAuthenticatedRequest } from '@/interface/middleware';

/**
 * Retrieves an event by its slug.
 * @param req - The HTTP request object containing the slug in the parameters.
 * @param res - The HTTP response object.
 * @returns The event details and total attendees.
 */
export const getEventBySlugController = catchAsync(
  async (req: IAuthenticatedRequest<{ slug?: string }, {}, {}>, res) => {
    const { slug } = req.params;

    logger.info('Getting event by slug in getEventBySlugController ...');
    const event = await EventRepository.findbySlug(slug);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const totalAttendees = await AttendeeRepository.countAttendees(event.id);

    return res
      .status(200)
      .json({ message: 'Event retrieved successfully', data: { event, totalAttendees } });
  }
);

/**
 * Retrieves an event by its ID.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns The event details and total attendees.
 */
export const getEventByIdController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    logger.info('Getting event by id in getEventByIdController ...');
    const event = await EventRepository.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const totalAttendees = await AttendeeRepository.countAttendees(event.id);

    return res.status(200).json({ event, totalAttendees });
  }
);

/**
 * Edits the slug of an event.
 * @param req - The HTTP request object containing the event ID in the parameters and the new slug in the body.
 * @param res - The HTTP response object.
 * @returns The updated slug.
 */
export const updateEventSlugController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, z.infer<typeof editSlugSchema>>, res) => {
    const { eventId } = req.params;
    const { userId } = req;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });
    const slug = req.body.slug;
    logger.info('Updating slug in updateEventSlugController ...')
    const updatedSlug = await EventRepository.updateSlug(eventId, userId, slug);
    return res.status(200).json({ data: updatedSlug, success: true });
  }
);

/**
 * Retrieves popular events based on a limit.
 * @param req - The HTTP request object containing the limit in the query.
 * @param res - The HTTP response object.
 * @returns A list of popular events.
 */
export const getPopularEventController = catchAsync(async (req, res) => {
  const { limit } = eventLimitSchema.parse(req.query);

  logger.info('Getting popular events in getPopularEventController ...');
  const popularEvents = await EventRepository.findAllPopularEvents(limit);

  return res
    .status(200)
    .json({ data: popularEvents, message: 'Popular events retrieved successfully' });
});

/**
 * Filters events based on query parameters.
 * @param req - The HTTP request object containing filter parameters in the query.
 * @param res - The HTTP response object.
 * @returns A list of filtered events with metadata.
 */
export const filterEventController = catchAsync(
  async (req: IAuthenticatedRequest<{}, {}, EventFilter>, res) => {
    logger.info('Filtering events in filterEventController ...');
    const filters = eventFilterSchema.parse(req.query);
    const events = await EventRepository.findEvents(filters);

    return res.status(200).json({
      message: 'Filtered Events Data',
      data: events,
    });
  }
);

/**
 * Retrieves upcoming events for a user.
 * @param req - The HTTP request object containing the user's ID and filter parameters in the query.
 * @param res - The HTTP response object.
 * @returns A list of upcoming events with metadata.
 */
export const getUserUpcomingEventController = catchAsync(
  async (req: IAuthenticatedRequest<{}, {}, UpcomingEventsQuery>, res) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });
    const filters = upcomingEventsQuerySchema.parse(req.query);

    logger.info('Getting upcoming event in getUserUpcomingEventController ..');
    const registeredEvents = await AttendeeRepository.findRegisteredEventsByUser({
      userId,
      ...filters,
    });

    return res.status(200).json({
      message: 'Registered events retrieved successfully',
      data: registeredEvents.events,
      metadata: registeredEvents.metadata,
    });
  }
);

/**
 * Creates a new event.
 * @param req - The HTTP request object containing event details in the body.
 * @param res - The HTTP response object.
 * @returns The newly created event object.
 */
export const createEventController = catchAsync(
  async (req: IAuthenticatedRequest<{}, {}, z.infer<typeof CreateEventSchema>>, res) => {
    const data = req.body;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    const getUserData = await UserRepository.findById(userId);
    if (!getUserData) return res.status(404).json({ message: 'User not found' });
    if (!getUserData.isCompleted)
      return res
        .status(400)
        .json({ message: 'Please complete your profile before creating event' });

    logger.info('Formatting data for create event in createEventController ...');
    const formattedData = {
      ...data,
      creatorId: userId,
      slug: sluggify(data.name),
      venueType: data.venueType.toUpperCase() as VenueType,
    };

    const newEvent = await EventRepository.create(formattedData);
    await CohostRepository.create({
      userId: userId,
      role: 'CREATOR',
      eventId: newEvent.id,
    });

    return res.status(201).json({ message: 'success', event: newEvent });
  }
);

/**
 * Updates an existing event.
 * @param req - The HTTP request object containing the event ID in the parameters and updated event details in the body.
 * @param res - The HTTP response object.
 * @returns The updated event object.
 */
export const updateEventController = catchAsync(
  async (
    req: IAuthenticatedRequest<{ eventId?: string }, {}, z.infer<typeof CreateEventSchema>>,
    res
  ) => {
    const eventId = req.params.eventId;
    const data = req.body;
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    logger.info('Updating event in updateEventController ...');
    const updatedEvent = await EventRepository.update(eventId, {
      ...data,
      venueType: data.venueType.toUpperCase() as VenueType,
    });

    return res.status(200).json({ message: 'success', event: updatedEvent });
  }
);

/**
 * Cancels an event by setting its `isActive` status to false.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns The canceled event object.
 */
export const cancelEventController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    const { userId } = req;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    logger.info('Finding event in cancelEventController ...');
    const event = await EventRepository.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.isActive) return res.status(400).json({ message: 'Event already cancelled' });
    const cancelEvent = await EventRepository.cancel(eventId, userId);

    return res.status(200).json({ data: cancelEvent, success: true });
  }
);

/**
 * Soft deletes an event by setting its `isDeleted` status to true.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns The deleted event object.
 */
export const deleteEventController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    const { userId } = req;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    logger.info('Finding event and deleting in deleteEventController ...');
    const event = await EventRepository.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.isDeleted) return res.status(400).json({ message: 'Event already deleted' });
    const deletedEvent = await EventRepository.delete(eventId, userId);

    return res.status(200).json({
      data: deletedEvent,
      message: 'Event deleted successfully',
      success: true,
    });
  }
);

/**
 * Retrieves all planned events for a specific user.
 * @param req - The HTTP request object containing filter parameters in the query.
 * @param res - The HTTP response object.
 * @returns A list of planned events for the user.
 */
export const getplannedByUserController = catchAsync(
  async (req: IAuthenticatedRequest<{}, {}, {}>, res) => {
    const { search, category, fromDate, toDate, venueType, page, limit, sortBy, sortOrder } =
      eventsPlannedByUserReqSchema.parse(req.query);

    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });
    const existingUser = await UserRepository.findById(userId);
    if (!existingUser) return res.status(401).json({ message: 'Invalid or expired token' });

    logger.info('Getting planned event in getplannedByUserController ...');
    const plannedEvents = await EventRepository.findAllPlannedEvents({
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
    return res.status(200).json({ message: 'success', data: plannedEvents });
  }
);

/**
 * Registers a user as an attendee for an event.
 * @param req - The HTTP request object containing the event ID in the parameters and attendee details in the body.
 * @param res - The HTTP response object.
 * @returns The newly created attendee object.
 */
export const createAttendeeController = catchAsync(
  async (
    req: IAuthenticatedRequest<{ eventId?: string }, {}, z.infer<typeof attendeePayloadSchema>>,
    res
  ) => {
    let attendeeStatus: Partial<Attendee> = {};
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    const user = await UserRepository.findById(userId);
    if (!user || !user.isCompleted) return res.status(400).json({ message: 'User profile is not completed' });

    const eventId = req.params.eventId;
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    logger.info('Finding event by id in createAttendeeController ...');
    const event = await EventRepository.findById(eventId as string);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.isActive) return res.status(400).json({ message: 'Event is not active' });

    const currentTime = new Date();
    if (event.endTime < currentTime) return res.status(400).json({ message: 'Event has expired' });

    if (event.capacity) {
      const currentAttendeeCount = await AttendeeRepository.countAttendees(eventId);
      if (currentAttendeeCount >= event.capacity) {
        return res.status(400).json({ message: 'Event is at full capacity. No seats available.' });
      }
    }

    if (!event.hostPermissionRequired) {
      attendeeStatus = { allowedStatus: true, status: Status.GOING };
    } else {
      attendeeStatus = { allowedStatus: false, status: Status.WAITING };
    }

    const existingAttendee = await AttendeeRepository.findByUserIdAndEventId(userId, eventId, true);
    if (existingAttendee) {
      const deleted_user = existingAttendee.isDeleted && existingAttendee.status === Status.NOT_GOING;
      if (deleted_user) {
        await AttendeeRepository.restore(existingAttendee.id);
        return res.status(200).json({ message: 'Attendee restored successfully' });
      }
      return res.status(400).json({ message: 'User already registered for this event' });
    }

    const uuid = randomUUID();
    const hash = createHash('sha256').update(uuid).digest('base64');
    const qrToken = hash.slice(0, 6);

    const attendeeData: Prisma.AttendeeCreateInput = {
      qrToken: qrToken,
      user: {
        connect: {
          id: userId,
        },
      },
      event: {
        connect: {
          id: eventId,
        },
      },
      status: attendeeStatus.status,
    };

    const newAttendee = await AttendeeRepository.create(attendeeData);
    const url = `${config.CLIENT_URL}/generateQr/${newAttendee.eventId}/${newAttendee.userId}`;

    const emailData = {
      id: 5,
      subject: 'Event Registration Confirmation',
      recipient: user.primaryEmail,
      body: {
        email: user.primaryEmail,
        qrLink: url,
      },
    };
    if (config.NODE_ENV !== 'development') {
      await EmailService.send(emailData);
    } else {
      logger.info('Email notification:', emailData);
    }

    return res.status(201).json(newAttendee);
  }
);

/**
 * Retrieves a paginated list of attendees for a specific event.
 * @param req - The HTTP request object containing the event ID in the parameters and pagination details in the query.
 * @param res - The HTTP response object.
 * @returns A paginated list of attendees.
 */
export const getAttendeeController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const eventId = req.params.eventId;
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    logger.info('Finding event by id in getAttendeeController ...');
    const event = await EventRepository.findById(eventId as string);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const pagination = await attendeesQuerySchema.parseAsync(req.query);
    const attendees = await AttendeeRepository.findAttendeesByEventId({ eventId, ...pagination });

    return res.status(200).json(attendees);
  }
);

/**
 * Exports the list of attendees for a specific event as an Excel sheet.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns An Excel file containing attendee details.
 */
export const getExcelSheetController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const eventId = req.params.eventId;
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    const event = await EventRepository.findById(eventId as string);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const attendees = await AttendeeRepository.findAllAttendees(eventId);
    
    logger.info('Mapping attendee in getExcelSheetController ...')
    const exportData = attendees.map((attendee, index) => ({
      'Sr. No': index + 1,
      'Full Name': attendee.user.fullName,
      Email: attendee.user.primaryEmail,
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

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const colWidths = [
      { wch: 36 },
      { wch: 10 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 40 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
    ];
    worksheet['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=attendees-${eventId}.xlsx`);

    res.send(excelBuffer);
  }
);

/**
 * Retrieves the details of an attendee for a specific event.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns The attendee details.
 */
export const getAttendeeTicketController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const userId = req.userId;
    const eventId = req.params.eventId;

    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    logger.info('Getting user ticket in getAttendeeTicketController ...');
    const attendee = await AttendeeRepository.findByUserIdAndEventId(userId, eventId);
    if (!attendee) return res.status(404).json({ message: 'Attendee not found' });

    return res.status(200).json({data: attendee, message: 'Fetch ticket successfully'});
  }
);

/**
 * Checks if a user is allowed to attend an event.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A success message if the user is allowed.
 */
export const getAllowAttendeeController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    const userId = req.userId;
    if (!eventId)
      return res.status(400).json({ message: API_MESSAGES.ALLOW_GUEST.EVENTID_REQUIRED });
    if (!userId) return res.status(401).json({ message: API_MESSAGES.ALLOW_GUEST.INVALID_TOKEN });

    logger.info('Finding host and cohost in getAllowAttendeeController ...');
    const hasAccess = await CohostRepository.FindhostOrCohost(userId, eventId);
    if (!hasAccess)
      return res.status(403).json({ message: API_MESSAGES.ALLOW_GUEST.UNAUTHORIZED_ACCESS });

    return res.status(200).json({
      message: API_MESSAGES.ALLOW_GUEST.SUCCESS,
      data: { success: true },
    });
  }
);

/**
 * Updates the allowed status of an attendee for a specific event.
 * @param req - The HTTP request object containing the event ID in the parameters and the allowed status in the body.
 * @param res - The HTTP response object.
 * @returns The updated attendee object.
 */
export const updateAttendeeStatusController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, IAllowStatus>, res) => {
    const { eventId } = req.params;
    const { userId, allowedStatus } = req.body;
    if (!eventId)
      return res.status(400).json({ message: API_MESSAGES.ALLOW_GUEST.EVENTID_REQUIRED });

    logger.info('Updating attendee status in updateAttendeeStatusController ...');
    const updatedAttendee = await AttendeeRepository.updateAllowStatus(
      eventId,
      userId,
      allowedStatus
    );

    return res.status(200).json({
      message: API_MESSAGES.ALLOW_GUEST.SUCCESSFUL_ATTENDEE_UPDATE,
      data: updatedAttendee,
    });
  }
);

/**
 * Retrieves an attendee by their QR token.
 * @param req - The HTTP request object containing the QR token and event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns The attendee details.
 */
export const scanTicketController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string; qrToken?: string }, {}, {}>, res) => {
    const { eventId, qrToken } = req.params;
    if (!qrToken) return res.status(400).json({ message: 'QR Token is required' });

    logger.info('Getting attendee using qr in scanTicketController ...');
    const attendee = await AttendeeRepository.findByQrToken(qrToken, eventId);
    if (!attendee) return res.status(404).json({ message: 'Attendee not found' });

    return res.status(200).json(attendee);
  }
);

/**
 * Verifies the QR token of an attendee for a specific event.
 * @param req - The HTTP request object containing the attendee ID and event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A success message if the QR token is valid.
 */
export const verifyQrController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string; attendeeId?: string }, {}, {}>, res) => {
    const userId = req.userId;
    const { attendeeId, eventId } = req.params;
    if (!attendeeId || !eventId)
      return res.status(400).json({ message: 'Attendee ID and Event ID is required' });
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    const attendee = await AttendeeRepository.findById(attendeeId);
    if (!attendee) return res.status(404).json({ message: 'Attendee not found' });

    if (attendee.eventId !== eventId)
      return res.status(400).json({ message: 'Attendee is not allowed' });
    if (!attendee.allowedStatus)
      return res.status(403).json({ message: 'Attendee is not allowed' });
    if (attendee.hasAttended) return res.status(400).json({ message: 'Already scanned ticket' });

    logger.info('Getting event using id in verifyQrController ...');
    const event = await EventRepository.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
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

    await AttendeeRepository.update(attendee.id, {
      hasAttended: true,
      checkInTime: currentTime,
    });

    return res.status(200).json({ message: 'Ticket is valid' });
  }
);

/**
 * Soft deletes an attendee record for a specific event.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A success message if the attendee is removed successfully.
 */
export const deleteAttendeeController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    logger.info('Getting attendee in deleteAttendeeController ...');
    const attendee = await AttendeeRepository.findByUserIdAndEventId(userId, eventId);
    if (!attendee) return res.status(404).json({ message: 'Attendee record not found' });

    if (attendee.userId === userId) {
      await AttendeeRepository.cancel(attendee.id);
      return res.status(200).json({
        message: 'Attendee removed successfully',
      });
    }

    const isCreator = await CohostRepository.FindhostOrCohost(userId, attendee.eventId);
    if (isCreator) {
      await AttendeeRepository.delete(attendee.id);
      return res.status(200).json({
        message: 'Attendee removed successfully',
      });
    }

    return res.status(403).json({ message: 'Unauthorized access' });
  }
);
