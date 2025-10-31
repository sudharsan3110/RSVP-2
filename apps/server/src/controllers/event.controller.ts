import config from '@/config/config';
import { API_MESSAGES } from '@/constants/apiMessages';
import { IAuthenticatedRequest } from '@/interface/middleware';
import { AttendeeRepository } from '@/repositories/attendee.repository';
import { CohostRepository } from '@/repositories/cohost.repository';
import { EventRepository } from '@/repositories/event.repository';
import { UserRepository } from '@/repositories/user.repository';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  TokenExpiredError,
} from '@/utils/apiError';
import { SuccessResponse } from '@/utils/apiResponse';
import catchAsync from '@/utils/catchAsync';
import { prisma } from '@/utils/connection';
import { controller } from '@/utils/controller';
import { sluggify } from '@/utils/function';
import logger from '@/utils/logger';
import EmailService from '@/utils/sendEmail';
import {
  attendeePayloadSchema,
  upcomingEventsQuerySchema,
} from '@/validations/attendee.validation';
import { eventParamsSchema } from '@/validations/cohost.validation';
import {
  attendeesQuerySchema,
  cancelEventSchema,
  CreateEventSchema,
  deleteEventSchema,
  eventFilterSchema,
  eventLimitSchema,
  eventSlugSchema,
  eventsPlannedByUserReqSchema,
  getEventByIdSchema,
  scanTicketSchema,
  updateAttendeeStatusSchema,
  UpdateEventSchema,
  updateEventSlugSchema,
  verifyQrSchema,
} from '@/validations/event.validation';
import { Attendee, AttendeeStatus, Prisma, VenueType } from '@prisma/client';
import { CalendarEvent, google, ics, outlook } from 'calendar-link';
import { createHash, randomUUID } from 'crypto';
import * as XLSX from 'xlsx';

/**
 * Retrieves an event by its slug.
 * @param req - The HTTP request object containing the slug in the parameters.
 * @param res - The HTTP response object.
 * @returns The event details and total attendees.
 */
export const getEventBySlugController = controller(eventSlugSchema, async (req, res) => {
  const { slug } = req.params;

  logger.info('Getting event by slug in getEventBySlugController ...');
  const event = await EventRepository.findbySlug(slug);
  if (!event) throw new NotFoundError('Event not found');
  const totalAttendees = await AttendeeRepository.countAttendees(event.id);

  return new SuccessResponse('success', {
    event: { ...event, cohosts: event.hosts },
    totalAttendees,
  }).send(res);
});

/**
 * Retrieves an event by its ID.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns The event details and total attendees.
 */
export const getEventByIdController = controller(getEventByIdSchema, async (req, res) => {
  const { eventId } = req.params;

  logger.info('Getting event by id in getEventByIdController ...');
  const event = await EventRepository.findById(eventId);
  if (!event) throw new NotFoundError('Event not found');
  const totalAttendees = await AttendeeRepository.countAttendees(event.id);

  let category;
  if (event.categoryId) {
    category = await prisma.category.findFirst({ where: { id: event.categoryId } });
  }

  return new SuccessResponse('success', {
    event: { ...event, cohosts: event.hosts, category: category?.name },
    totalAttendees,
  }).send(res);
});

/**
 * Edits the slug of an event.
 * @param req - The HTTP request object containing the event ID in the parameters and the new slug in the body.
 * @param res - The HTTP response object.
 * @returns The updated slug.
 */
export const updateEventSlugController = controller(updateEventSlugSchema, async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req;
  if (!userId) throw new TokenExpiredError();

  const slug = req.body.slug;
  logger.info('Updating slug in updateEventSlugController ...');
  const updatedSlug = await EventRepository.updateSlug(eventId, userId, slug);
  return new SuccessResponse('success', updatedSlug).send(res);
});

/**
 * Retrieves popular events based on a limit.
 * @param req - The HTTP request object containing the limit in the query.
 * @param res - The HTTP response object.
 * @returns A list of popular events.
 */
export const getPopularEventController = controller(eventLimitSchema, async (req, res) => {
  const { limit } = req.query;

  logger.info('Getting popular events in getPopularEventController ...');
  const popularEvents = await EventRepository.findAllPopularEvents(limit);

  return new SuccessResponse('success', popularEvents).send(res);
});

/**
 * Filters events based on query parameters.
 * @param req - The HTTP request object containing filter parameters in the query.
 * @param res - The HTTP response object.
 * @returns A list of filtered events with metadata.
 */
export const filterEventController = controller(eventFilterSchema, async (req, res) => {
  logger.info('Filtering events in filterEventController ...');
  const filters = req.query;
  if (filters.category) {
    const category = await prisma.category.findFirst({ where: { name: filters.category } });

    if (!category?.id) {
      filters.category = 'not found';
    } else {
      filters.category = category?.id;
    }
  }
  const events = await EventRepository.findEvents(filters);

  return new SuccessResponse('success', events).send(res);
});

/**
 * Retrieves upcoming events for a user.
 * @param req - The HTTP request object containing the user's ID and filter parameters in the query.
 * @param res - The HTTP response object.
 * @returns A list of upcoming events with metadata.
 */
export const getUserUpcomingEventController = controller(
  upcomingEventsQuerySchema,
  async (req, res) => {
    const { userId } = req;
    if (!userId) throw new TokenExpiredError();

    const filters = req.query;

    logger.info('Getting upcoming event in getUserUpcomingEventController ..');
    const registeredEvents = await AttendeeRepository.findRegisteredEventsByUser({
      userId,
      ...filters,
    });

    const hostedEvents = await EventRepository.getEventByCreatorId({
      creatorId: userId,
      ...filters,
    });

    const mergedEvents = [...registeredEvents.events, ...hostedEvents].sort((a, b) => {
      if (filters.startDate) {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      } else {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      }
    });

    const data = {
      events: mergedEvents,
      metadata: registeredEvents.metadata,
    };
    return new SuccessResponse('Registered events retrieved successfully', data).send(res);
  }
);

/**
 * Creates a new event.
 * @param req - The HTTP request object containing event details in the body.
 * @param res - The HTTP response object.
 * @returns The newly created event object.
 */
export const createEventController = controller(CreateEventSchema, async (req, res) => {
  const { richtextDescription, plaintextDescription, category, ...data } = req.body;
  const userId = req.userId;
  if (!userId) throw new TokenExpiredError();

  const getUserData = await UserRepository.findById(userId);
  if (!getUserData) throw new NotFoundError('User not found');
  if (!getUserData.isCompleted)
    throw new BadRequestError('Please complete your profile before creating event');

  if (plaintextDescription && plaintextDescription.length > 300)
    throw new BadRequestError('Description cannot be greater than 300 characters.');

  logger.info('Formatting data for create event in createEventController ...');

  // Find `category` in the `categories` table.
  let categoryData = await prisma.category.findFirst({ where: { name: category } });

  // If not exists - create a new record.
  if (!categoryData) {
    categoryData = await prisma.category.create({ data: { name: category } });
  }

  const formattedData = {
    ...data,
    categoryId: categoryData.id,
    description: richtextDescription,
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

  return new SuccessResponse('success', newEvent).send(res);
});

/**
 * Updates an existing event.
 * @param req - The HTTP request object containing the event ID in the parameters and updated event details in the body.
 * @param res - The HTTP response object.
 * @returns The updated event object.
 */
export const updateEventController = controller(UpdateEventSchema, async (req, res) => {
  const { eventId } = req.params;
  const { richtextDescription, plaintextDescription, category, ...data } = req.body;

  if (!data.venueType) throw new BadRequestError('Venue type cannot be updated');

  if (plaintextDescription && plaintextDescription.length > 300)
    throw new BadRequestError('Description cannot be greater than 300 characters.');

  // Find `category` in the `categories` table.
  let categoryData = await prisma.category.findFirst({ where: { name: category } });

  // If not exists - create a new record.
  if (!categoryData && category) {
    categoryData = await prisma.category.create({ data: { name: category } });
  }

  logger.info('Updating event in updateEventController ...');
  const event = await EventRepository.findById(eventId);

  // current is private and converting to public
  if (event?.hostPermissionRequired == true && data.hostPermissionRequired == false) {
    const where: Prisma.AttendeeWhereInput = {
      eventId,
      status: AttendeeStatus.WAITING,
      isDeleted: false,
    };
    await AttendeeRepository.updateMultipleAttendeesStatus(where, AttendeeStatus.GOING);
  }

  const updatedEvent = await EventRepository.update(eventId, {
    ...data,
    categoryId: categoryData?.id,
    description: richtextDescription,
    venueType: data.venueType.toUpperCase() as VenueType,
  });

  // Send email notification to all attendees except for date changes
  const { startTime, endTime, ...otherChanges } = data;
  const hasOtherChanges = Object.keys(otherChanges).length > 0;

  if (hasOtherChanges) {
    const attendees = await AttendeeRepository.findAllAttendees(eventId);
    const cohosts = await CohostRepository.findAllByEventId(eventId);
    const creatorEmail = (cohosts || []).find((cohost: any) => cohost.role === 'CREATOR')?.user
      ?.primaryEmail;
    const bccEmails = attendees.map((attendee: any) => attendee.user?.primaryEmail).filter(Boolean);

    if (bccEmails.length > 0 && config.NODE_ENV !== 'development') {
      await EmailService.send({
        id: 6,
        subject: 'Your event has been updated',
        recipient: creatorEmail,
        bcc: bccEmails,
        body: {
          eventName: updatedEvent.name,
          updatesLink: `${config.CLIENT_URL}/${updatedEvent.slug}`,
          updatesText:
            'The event details have been updated. Please check the event page for more information.',
        },
      });
    } else {
      logger.info('Email notification (event update):');
    }
  }

  return new SuccessResponse('success', updatedEvent).send(res);
});

/**
 * Cancels an event by setting its `isActive` status to false.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns The canceled event object.
 */
export const cancelEventController = controller(cancelEventSchema, async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req;
  if (!userId) throw new TokenExpiredError();

  logger.info('Finding event in cancelEventController ...');
  const event = await EventRepository.findById(eventId);
  if (!event) throw new NotFoundError('Event not found');
  if (!event.isActive) throw new BadRequestError('Event already cancelled');
  const cancelEvent = await EventRepository.cancel(eventId, userId);

  return new SuccessResponse('success', cancelEvent).send(res);
});

/**
 * Soft deletes an event by setting its `isDeleted` status to true.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns The deleted event object.
 */
export const deleteEventController = controller(deleteEventSchema, async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req;
  if (!userId) throw new TokenExpiredError();

  logger.info('Finding event and deleting in deleteEventController ...');
  const event = await EventRepository.findById(eventId);
  if (!event) throw new NotFoundError('Event not found');
  if (event.isDeleted) throw new BadRequestError('Event already deleted');
  const deletedEvent = await EventRepository.delete(eventId, userId);

  return new SuccessResponse('Event deleted successfully', deletedEvent).send(res);
});

/**
 * Retrieves all planned events for a specific user.
 * @param req - The HTTP request object containing filter parameters in the query.
 * @param res - The HTTP response object.
 * @returns A list of planned events for the user.
 */
export const getplannedByUserController = controller(
  eventsPlannedByUserReqSchema,
  async (req, res) => {
    const { page, limit, status, sort, sortOrder, search } = req.query;

    const userId = req.userId;
    if (!userId) throw new TokenExpiredError();

    const existingUser = await UserRepository.findById(userId);
    if (!existingUser) throw new TokenExpiredError();

    logger.info('Getting planned event in getplannedByUserController ...');

    const sortByField = sort === 'attendees' ? 'attendeeCount' : 'startTime';

    const plannedEvents = await EventRepository.findAllPlannedEvents({
      filters: {
        userId,
        status,
        search,
      },
      pagination: {
        page,
        limit,
        sortBy: sortByField,
        sortOrder,
      },
    });

    return new SuccessResponse('success', plannedEvents).send(res);
  }
);
/**
 * Registers a user as an attendee for an event.
 * @param req - The HTTP request object containing the event ID in the parameters and attendee details in the body.
 * @param res - The HTTP response object.
 * @returns The newly created attendee object.
 */
export const createAttendeeController = controller(attendeePayloadSchema, async (req, res) => {
  let attendeeStatus: Partial<Attendee> = {};
  const userId = req.userId;
  if (!userId) throw new TokenExpiredError();

  const user = await UserRepository.findById(userId);
  if (!user || !user.isCompleted) throw new BadRequestError('User profile is not completed');

  const { eventId } = req.params;

  logger.info('Finding event by id in createAttendeeController ...');

  const event = await EventRepository.findById(eventId);
  if (!event) throw new NotFoundError('Event not found');
  if (!event.isActive) throw new BadRequestError('Event is not active');

  const currentTime = new Date();
  if (event.endTime < currentTime) throw new BadRequestError('Event has expired');

  if (event.capacity) {
    const currentAttendeeCount = await AttendeeRepository.countAttendees(eventId);

    // -1 is depicted to be a capacity of infinite
    if (currentAttendeeCount != -1 && currentAttendeeCount >= event.capacity) {
      throw new BadRequestError('Event is at full capacity. No seats available.');
    }
  }

  if (!event.hostPermissionRequired) {
    attendeeStatus = { allowedStatus: true, status: AttendeeStatus.GOING };
  } else {
    attendeeStatus = { allowedStatus: false, status: AttendeeStatus.WAITING };
  }

  const existingAttendee = await AttendeeRepository.findByUserIdAndEventId(userId, eventId, null);
  if (existingAttendee) {
    const isUserTicketCancelled =
      existingAttendee.isDeleted && existingAttendee.status === AttendeeStatus.CANCELLED;
    if (isUserTicketCancelled) {
      const restoredAttendee = await AttendeeRepository.restore(
        existingAttendee.id,
        event.hostPermissionRequired ? AttendeeStatus.WAITING : AttendeeStatus.GOING,
        event.hostPermissionRequired ? false : true
      );
      attendeeStatus = { isDeleted: false, status: AttendeeStatus.GOING };
      return new SuccessResponse('Attendee restored successfully', restoredAttendee).send(res);
    }
    throw new BadRequestError('User already registered for this event');
  }

  const uuid = randomUUID();
  const hash = createHash('sha256').update(uuid).digest('base64');
  const qrToken = hash.slice(0, 6);

  const attendeeData: Prisma.AttendeeCreateInput = {
    ...attendeeStatus,
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
  };

  const newAttendee = await AttendeeRepository.create(attendeeData);
  const url = `${config.CLIENT_URL}/ticket/${newAttendee.eventId}`;

  const calendarEvent: CalendarEvent = {
    uid: event.id,
    title: event.name,
    description: event.description || '',
    start: event.startTime,
    end: event.endTime,
    location: event.venueUrl || '',
  };

  const emailData = {
    id: 5,
    subject: 'Ticket Confirmed',
    recipient: user.primaryEmail,
    body: {
      ticketLink: url,
      name: user.fullName ?? 'Guest',
      eventName: event.name,
      badgeNumber: newAttendee.qrToken,
      googleCalendarLink: google(calendarEvent),
      iCalendarLink: ics(calendarEvent),
      outlookCalendarLink: outlook(calendarEvent),
    },
  };
  if (config.NODE_ENV !== 'development') {
    await EmailService.send(emailData);
  } else {
    logger.info('Email notification:', emailData);
  }

  return new SuccessResponse('success', newAttendee).send(res);
});

/**
 * Retrieves a paginated list of attendees for a specific event.
 * @param req - The HTTP request object containing the event ID in the parameters and pagination details in the query.
 * @param res - The HTTP response object.
 * @returns A paginated list of attendees.
 */
export const getAttendeeController = controller(attendeesQuerySchema, async (req, res) => {
  const { eventId } = req.params;
  logger.info('Finding event by id in getAttendeeController ...');
  const event = await EventRepository.findById(eventId);
  if (!event) throw new NotFoundError('Event not found');

  const attendees = await AttendeeRepository.findAttendeesByEventId({
    eventId,
    ...req.query,
  });

  return new SuccessResponse('success', attendees).send(res);
});

/**
 * Exports the list of attendees for a specific event as an Excel sheet.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns An Excel file containing attendee details.
 */
export const getExcelSheetController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const eventId = req.params.eventId;
    if (!eventId) throw new BadRequestError('Event ID is required');

    const event = await EventRepository.findById(eventId as string);
    if (!event) throw new NotFoundError('Event not found');

    const attendees = await AttendeeRepository.findAllAttendees(eventId);

    logger.info('Mapping attendee in getExcelSheetController ...');
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
export const getAttendeeTicketController = controller(eventParamsSchema, async (req, res) => {
  const userId = req.userId;
  const { eventId } = req.params;

  if (!userId) throw new TokenExpiredError();

  logger.info('Getting user ticket in getAttendeeTicketController ...');
  const attendee = await AttendeeRepository.findByUserIdAndEventId(userId, eventId);
  if (!attendee) throw new NotFoundError('Attendee not found');

  return new SuccessResponse('success', attendee).send(res);
});

/**
 * Updates the allowed status and status of an attendee for a specific event.
 * @param req - The HTTP request object containing the attendee ID in the parameters and the allowed status in the body.
 * @param res - The HTTP response object.
 * @returns The updated attendee object.
 */
export const updateAttendeeStatusController = controller(
  updateAttendeeStatusSchema,
  async (req, res) => {
    const { attendeeId } = req.params;
    const { allowedStatus } = req.body;

    logger.info('Updating attendee status in updateAttendeeStatusController ...');
    const updatedAttendee = await AttendeeRepository.updateAttendeeStatus(
      attendeeId,
      allowedStatus
    );

    return new SuccessResponse(
      API_MESSAGES.ALLOW_GUEST.SUCCESSFUL_ATTENDEE_UPDATE,
      updatedAttendee
    ).send(res);
  }
);

/**
 * Retrieves an attendee by their QR token.
 * @param req - The HTTP request object containing the QR token and event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns The attendee details.
 */
export const scanTicketController = controller(scanTicketSchema, async (req, res) => {
  const { eventId, qrToken } = req.params;

  logger.info('Getting attendee using qr in scanTicketController ...');
  const attendee = await AttendeeRepository.findByQrToken(qrToken, eventId);
  if (!attendee) throw new NotFoundError('Attendee not found');

  return new SuccessResponse('success', attendee).send(res);
});

/**
 * Verifies the QR token of an attendee for a specific event.
 * @param req - The HTTP request object containing the attendee ID and event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A success message if the QR token is valid.
 */
export const verifyQrController = controller(verifyQrSchema, async (req, res) => {
  const userId = req.userId;
  const { attendeeId, eventId } = req.params;

  if (!userId) throw new TokenExpiredError();

  const attendee = await AttendeeRepository.findById(attendeeId);
  if (!attendee) throw new NotFoundError('Attendee not found');

  if (attendee.eventId !== eventId) throw new BadRequestError('Attendee is not allowed');
  if (!attendee.allowedStatus) throw new ForbiddenError('Attendee is not allowed');
  if (attendee.hasAttended) throw new BadRequestError('Already scanned ticket');

  logger.info('Getting event using id in verifyQrController ...');
  const event = await EventRepository.findById(eventId);
  if (!event) throw new NotFoundError('Event not found');
  const currentTime = new Date();
  const eventStartTime = new Date(event.startTime);
  const eventEndTime = new Date(event.endTime);

  const verificationStartTime = new Date(eventStartTime);
  verificationStartTime.setHours(eventStartTime.getHours() - 1);

  if (currentTime < verificationStartTime) {
    throw new BadRequestError('Ticket verification will start 1 hour before the event');
  }

  if (currentTime > eventEndTime) {
    throw new BadRequestError('Event has ended. Ticket is no longer valid');
  }

  await AttendeeRepository.update(attendee.id, {
    hasAttended: true,
    checkInTime: currentTime,
  });

  return new SuccessResponse('success', { message: 'Ticket is valid' }).send(res);
});

/**
 * Soft deletes an attendee record for a specific event.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A success message if the attendee is removed successfully.
 */
export const deleteAttendeeController = controller(eventParamsSchema, async (req, res) => {
  const { eventId } = req.params;
  const userId = req.userId;
  if (!userId) throw new TokenExpiredError();

  const currentDate = new Date();

  const event = await EventRepository.findById(eventId);
  if (!event) throw new NotFoundError('Event not found');

  if (event?.endTime < currentDate)
    throw new NotFoundError('The event has already ended, cannot cancel registration.');

  logger.info('Getting attendee in deleteAttendeeController ...');
  const attendee = await AttendeeRepository.findByUserIdAndEventId(userId, eventId);
  if (!attendee) throw new NotFoundError('Attendee record not found');
  const cancelledAttendee = await AttendeeRepository.cancel(attendee.id);
  return new SuccessResponse('Attendee removed successfully', cancelledAttendee).send(res);
});
