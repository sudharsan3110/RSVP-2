import { Router } from 'express';
import { createEvent } from '@/controllers/event.controller';
import { createAttendee } from '@/controllers/event.controller';
import { validate } from '@/middleware/validate';
import { CreateEventSchema } from '@/validations/event.validation';
import { attendeePayloadSchema, attendeeParamsSchema } from '@/validations/attendee.validation';
import authMiddleware from '@/middleware/authMiddleware';

const eventRouter: Router = Router();

eventRouter.post('/', authMiddleware, validate({ body: CreateEventSchema }), createEvent);
eventRouter.post(
  '/:eventId/attendees',
  authMiddleware,
  validate({ params: attendeeParamsSchema, body: attendeePayloadSchema }),
  createAttendee
);

export { eventRouter };
