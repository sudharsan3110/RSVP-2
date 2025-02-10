import {
  allPlannedEvents,
  createAttendee,
  createEvent,
  deleteEvent,
  filterEvents,
  getAttendeeByQrToken,
  getAttendeeDetails,
  getAttendees,
  getAttendeesExcelSheet,
  getEventById,
  getEventBySlug,
  plannedByUser,
  updateEvent,
  filterEvents,
  softDeleteAttendee,
  getEventById,
  getPopularEvents,
  updateEvent,
  verifyQrToken,
} from '@/controllers/event.controller';
import {
  attendeeParamsSchema,
  attendeePayloadSchema,
  qrTokenSchema,
  verifyQrTokenPayloadSchema,
} from '@/validations/attendee.validation';
import {
  attendeesQuerySchema,
  CreateEventSchema,
  eventParamsSchema,
  getEventBySlugSchema,
  userUpdateSchema,
  eventLimitSchema,
} from '@/validations/event.validation';
import e, { Router } from 'express';

import {
  createNotification,
  getNotification,
  uploadEventImage,
} from '@/controllers/update.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { eventManageMiddleware } from '@/middleware/hostMiddleware';
import { validate } from '@/middleware/validate';
import {
  eventAttendeeReqSchema,
  eventsPlannedByUserReqSchema,
} from '@/validations/event.validation';
import { Role } from '@prisma/client';
import { paginationParamsSchema } from '@/validations/pagination.validation';

const eventRouter: Router = Router();

eventRouter.get('/slug/:slug', validate({ params: getEventBySlugSchema }), getEventBySlug);

eventRouter.post('/', authMiddleware, validate({ body: CreateEventSchema }), createEvent);



eventRouter.get('/popular', validate({query:eventLimitSchema}), getPopularEvents);

eventRouter.get('/upload-image', uploadEventImage);

eventRouter.get('/filter', filterEvents);


eventRouter.get('/:eventId', authMiddleware, getEventById);

eventRouter.patch(
  '/:eventId',
  authMiddleware,
  validate({ params: eventAttendeeReqSchema, body: CreateEventSchema }),
  updateEvent
);

eventRouter.delete(
  '/:eventId',
  authMiddleware,
  validate({ params: eventAttendeeReqSchema }),
  eventManageMiddleware([Role.Creator]),
  deleteEvent
);

eventRouter.get(
  '/user',
  authMiddleware,
  validate({ query: eventsPlannedByUserReqSchema }),
  plannedByUser
);

eventRouter.post(
  '/:eventId/attendees',
  authMiddleware,
  validate({ params: attendeeParamsSchema, body: attendeePayloadSchema }),
  createAttendee
);

eventRouter.get(
  '/:eventId/attendees',
  authMiddleware,
  validate({ params: eventParamsSchema, query: attendeesQuerySchema }),
  getAttendees
);

eventRouter.get(
  '/:eventId/attendees/excel',
  authMiddleware,
  validate({ params: eventParamsSchema }),
  getAttendeesExcelSheet
);

eventRouter.post(
  '/:eventId/communications',
  authMiddleware,
  validate({ params: eventParamsSchema, body: userUpdateSchema }),
  createNotification
);

eventRouter.get(
  '/:eventId/communications',
  authMiddleware,
  validate({ params: eventParamsSchema }),
  getNotification
);
eventRouter.get(
  '/:eventId/attendees/:userId',
  authMiddleware,
  validate({ params: attendeeParamsSchema }),
  getAttendeeDetails
);
eventRouter.post(
  '/attendee/verify',
  authMiddleware,
  validate({ body: verifyQrTokenPayloadSchema }),
  eventManageMiddleware([Role.Creator, Role.Manager]),
  verifyQrToken
);

eventRouter.get(
  '/:eventId/attendee/qr/:qrToken',
  authMiddleware,
  validate({ params: qrTokenSchema }),
  eventManageMiddleware([Role.Creator, Role.Manager]),
  getAttendeeByQrToken
);

eventRouter.delete(
  '/:eventId/attendee',
  authMiddleware,
  validate({ params: eventParamsSchema }),
  softDeleteAttendee
);
export { eventRouter };
