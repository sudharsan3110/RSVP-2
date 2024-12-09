import {
  createAttendee,
  createEvent,
  deleteEvent,
  plannedByUser,
  updateEvent,
} from '@/controllers/event.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { eventManageMiddleware } from '@/middleware/hostMiddleware';
import { validate } from '@/middleware/validate';
import { attendeeParamsSchema, attendeePayloadSchema } from '@/validations/attendee.validation';
import {
  CreateEventSchema,
  eventAttendeeReqSchema,
  eventsPlannedByUserReqSchema,
} from '@/validations/event.validation';
import { Router } from 'express';

const eventRouter: Router = Router();

eventRouter.post('/', authMiddleware, validate({ body: CreateEventSchema }), createEvent);

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
  eventManageMiddleware(['Admin']),
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

export { eventRouter };
