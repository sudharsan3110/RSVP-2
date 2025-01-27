import { Router } from 'express';
import {
  createEvent,
  createAttendee,
  deleteEvent,
  plannedByUser,
  getAttendeeDetails,
  verifyQrToken,
  getAttendeeByQrToken,
  getEventBySlug,
  updateEvent,
  allPlannedEvents,
  filterEvents,
  softDeleteAttendee,
  getEventById,
} from '@/controllers/event.controller';
import {
  CreateEventSchema,
  eventParamsSchema,
  getEventBySlugSchema,
  userUpdateSchema,
} from '@/validations/event.validation';
import {
  attendeePayloadSchema,
  attendeeParamsSchema,
  attendeeIdSchema,
  verifyQrTokenPayloadSchema,
  qrTokenSchema,
} from '@/validations/attendee.validation';

import authMiddleware from '@/middleware/authMiddleware';
import { eventManageMiddleware } from '@/middleware/hostMiddleware';
import { validate } from '@/middleware/validate';
import {
  eventAttendeeReqSchema,
  eventsPlannedByUserReqSchema,
} from '@/validations/event.validation';
import {
  createNotification,
  getNotification,
  uploadEventImage,
} from '@/controllers/update.controller';
import upload from '@/middleware/multerUploadMiddleware';
import { Role } from '@prisma/client';

const eventRouter: Router = Router();

eventRouter.get('/slug/:slug', validate({ params: getEventBySlugSchema }), getEventBySlug);

eventRouter.post('/', authMiddleware, validate({ body: CreateEventSchema }), createEvent);

eventRouter.get('/upload-image', uploadEventImage);

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
eventRouter.get('/', allPlannedEvents);

eventRouter.get('/filter', authMiddleware, filterEvents);

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
