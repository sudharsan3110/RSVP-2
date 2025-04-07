import {
  allPlannedEvents,
  cancelEvent,
  checkAllowStatus,
  createAttendee,
  createEvent,
  deleteEvent,
  editEventSlug,
  filterEvents,
  getAttendeeByQrToken,
  getAttendeeDetails,
  getAttendees,
  getAttendeesExcelSheet,
  getEventById,
  getEventBySlug,
  getPopularEvents,
  plannedByUser,
  softDeleteAttendee,
  updateAttendeeAllowStatus,
  updateEvent,
  verifyQrToken,
  getUpcomingEventsByUser
} from '@/controllers/event.controller';

import {
  attendeeParamsSchema,
  attendeePayloadSchema,
  idParamsSchema,
  qrTokenSchema,
  verifyQrTokenParamsSchema,
  upcomingEventsQuerySchema,
} from '@/validations/attendee.validation';
import {
  attendeesQuerySchema,
  CreateEventSchema,
  eventLimitSchema,
  eventParamsSchema,
  getEventBySlugSchema,
  userUpdateSchema,
} from '@/validations/event.validation';
import { Router } from 'express';

import {
  createNotification,
  getNotification,
  uploadEventImage,
} from '@/controllers/update.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { eventManageMiddleware } from '@/middleware/hostMiddleware';
import { apiLimiter, qrVerifyLimiter } from '@/middleware/rateLimiter';
import { validate } from '@/middleware/validate';
import {
  eventAttendeeReqSchema,
  eventsPlannedByUserReqSchema,
} from '@/validations/event.validation';
import { Role } from '@prisma/client';

const eventRouter: Router = Router();

eventRouter.get('/upload-image', apiLimiter, uploadEventImage);

eventRouter.get(
  '/slug/:slug',
  apiLimiter,
  validate({ params: getEventBySlugSchema }),
  getEventBySlug
);
eventRouter.get('/', apiLimiter, allPlannedEvents);

eventRouter.post(
  '/',
  apiLimiter,
  authMiddleware,
  validate({ body: CreateEventSchema }),
  createEvent
);
eventRouter.get(
  '/upcoming',
  apiLimiter,
  authMiddleware,
  validate({ query: upcomingEventsQuerySchema }),
  getUpcomingEventsByUser
);

eventRouter.get('/popular', apiLimiter, validate({ query: eventLimitSchema }), getPopularEvents);

eventRouter.get('/filter', apiLimiter, filterEvents);

eventRouter.get(
  '/user',
  apiLimiter,
  authMiddleware,
  validate({ query: eventsPlannedByUserReqSchema }),
  plannedByUser
);
eventRouter.get('/:eventId', apiLimiter, authMiddleware, getEventById);

eventRouter.patch(
  '/:eventId',
  apiLimiter,
  authMiddleware,
  validate({ params: eventAttendeeReqSchema, body: CreateEventSchema }),
  eventManageMiddleware([Role.Creator]),
  updateEvent
);

eventRouter.patch(
  '/:eventId/cancel',
  apiLimiter,
  authMiddleware,
  validate({ params: eventAttendeeReqSchema }),
  eventManageMiddleware([Role.Creator]),
  cancelEvent
);

eventRouter.delete(
  '/:eventId',
  apiLimiter,
  authMiddleware,
  validate({ params: eventAttendeeReqSchema }),
  eventManageMiddleware([Role.Creator]),
  deleteEvent
);

eventRouter.patch(
  '/:id/slug',
  apiLimiter,
  authMiddleware,
  validate({ params: idParamsSchema, body: attendeePayloadSchema }),
  eventManageMiddleware([Role.Creator]),
  editEventSlug
);

eventRouter.post(
  '/:eventId/attendees',
  apiLimiter,
  authMiddleware,
  validate({ params: attendeeParamsSchema }),
  createAttendee
);

eventRouter.get(
  '/:eventId/attendees',
  apiLimiter,
  authMiddleware,
  validate({ params: eventParamsSchema, query: attendeesQuerySchema }),
  eventManageMiddleware([Role.Creator, Role.Manager]),
  getAttendees
);

eventRouter.get(
  '/:eventId/attendees/excel',
  apiLimiter,
  authMiddleware,
  validate({ params: eventParamsSchema }),
  eventManageMiddleware([Role.Creator, Role.Manager]),
  getAttendeesExcelSheet
);

eventRouter.post(
  '/:eventId/communications',
  apiLimiter,
  authMiddleware,
  validate({ params: eventParamsSchema, body: userUpdateSchema }),
  eventManageMiddleware([Role.Creator, Role.Manager]),
  createNotification
);

eventRouter.get(
  '/:eventId/communications',
  apiLimiter,
  authMiddleware,
  validate({ params: eventParamsSchema }),
  getNotification
);
eventRouter.get(
  '/:eventId/attendees/ticket',
  apiLimiter,
  authMiddleware,
  validate({ params: attendeeParamsSchema }),
  getAttendeeDetails
);
eventRouter.patch(
  '/:eventId/attendee/:attendeeId/verify',
  qrVerifyLimiter,
  authMiddleware,
  validate({ params: verifyQrTokenParamsSchema }),
  eventManageMiddleware([Role.Creator, Role.Manager]),
  verifyQrToken
);

eventRouter.get(
  '/:eventId/attendee/qr/:qrToken',
  apiLimiter,
  authMiddleware,
  validate({ params: qrTokenSchema }),
  eventManageMiddleware([Role.Creator, Role.Manager]),
  getAttendeeByQrToken
);
eventRouter.get(
  '/:eventId/attendee/:userId/allowStatus',
  apiLimiter,
  authMiddleware,
  validate({ params: eventParamsSchema }),
  eventManageMiddleware([Role.Creator, Role.Manager]),
  checkAllowStatus
);

eventRouter.patch(
  '/:eventId/attendee/allowStatus',
  apiLimiter,
  authMiddleware,
  validate({ params: eventParamsSchema }),
  eventManageMiddleware([Role.Creator, Role.Manager]),
  updateAttendeeAllowStatus
);

eventRouter.delete(
  '/:eventId/attendee',
  apiLimiter,
  authMiddleware,
  validate({ params: eventParamsSchema }),
  softDeleteAttendee
);

export { eventRouter };
