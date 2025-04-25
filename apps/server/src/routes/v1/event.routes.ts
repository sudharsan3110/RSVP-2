import {
  cancelEventController,
  createAttendeeController,
  createEventController,
  deleteAttendeeController,
  deleteEventController,
  filterEventController,
  getAllowAttendeeController,
  getAttendeeController,
  getAttendeeTicketController,
  getEventByIdController,
  getEventBySlugController,
  getExcelSheetController,
  getplannedByUserController,
  getPopularEventController,
  getUserUpcomingEventController,
  scanTicketController,
  updateAttendeeStatusController,
  updateEventController,
  updateEventSlugController,
  verifyQrController,
} from '@/controllers/event.controller';

import {
  attendeeParamsSchema,
  attendeePayloadSchema,
  idParamsSchema,
  qrTokenSchema,
  upcomingEventsQuerySchema,
  verifyQrTokenParamsSchema,
} from '@/validations/attendee.validation';
import {
  attendeesQuerySchema,
  CreateEventSchema,
  eventFilterSchema,
  eventLimitSchema,
  eventParamsSchema,
  getEventBySlugSchema,
  userUpdateSchema,
} from '@/validations/event.validation';
import { Router } from 'express';

import {
  getMessageController,
  sendMessageController,
  uploadEventImageController,
} from '@/controllers/update.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { eventManageMiddleware } from '@/middleware/hostMiddleware';
import { validate } from '@/middleware/validate';
import { eventsPlannedByUserReqSchema } from '@/validations/event.validation';
import { Role } from '@prisma/client';

const eventRouter: Router = Router();

eventRouter.get('/upload-image', uploadEventImageController);

eventRouter.get('/', validate({ query: eventFilterSchema }), filterEventController);

eventRouter.get(
  '/slug/:slug',
  validate({ params: getEventBySlugSchema }),
  getEventBySlugController
);

eventRouter.post('/', authMiddleware, validate({ body: CreateEventSchema }), createEventController);

eventRouter.get(
  '/upcoming',
  authMiddleware,
  validate({ query: upcomingEventsQuerySchema }),
  getUserUpcomingEventController
);

eventRouter.get('/popular', validate({ query: eventLimitSchema }), getPopularEventController);

eventRouter.get(
  '/user',
  authMiddleware,
  validate({ query: eventsPlannedByUserReqSchema }),
  getplannedByUserController
);

eventRouter.get(
  '/:eventId',
  validate({ params: eventParamsSchema }),
  authMiddleware,
  getEventByIdController
);

eventRouter.patch(
  '/:eventId',
  authMiddleware,
  validate({ params: eventParamsSchema, body: CreateEventSchema }),
  eventManageMiddleware([Role.CREATOR]),
  updateEventController
);

eventRouter.patch(
  '/:eventId/cancel',
  authMiddleware,
  validate({ params: eventParamsSchema }),
  eventManageMiddleware([Role.CREATOR]),
  cancelEventController
);

eventRouter.delete(
  '/:eventId',
  authMiddleware,
  validate({ params: eventParamsSchema }),
  eventManageMiddleware([Role.CREATOR]),
  deleteEventController
);

eventRouter.get(
  '/user',
  authMiddleware,
  validate({ params: idParamsSchema, body: attendeePayloadSchema }),
  eventManageMiddleware([Role.CREATOR]),
  updateEventSlugController
);

eventRouter.post(
  '/:eventId/attendees',
  authMiddleware,
  validate({ params: attendeeParamsSchema }),
  createAttendeeController
);

eventRouter.get(
  '/:eventId/attendees',
  authMiddleware,
  validate({ params: eventParamsSchema, query: attendeesQuerySchema }),
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  getAttendeeController
);

eventRouter.get(
  '/:eventId/attendees/excel',
  authMiddleware,
  validate({ params: eventParamsSchema }),
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  getExcelSheetController
);

eventRouter.post(
  '/:eventId/communications',
  authMiddleware,
  validate({ params: eventParamsSchema, body: userUpdateSchema }),
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  sendMessageController
);

eventRouter.get(
  '/:eventId/communications',
  authMiddleware,
  validate({ params: eventParamsSchema }),
  getMessageController
);

eventRouter.get(
  '/:eventId/attendees/ticket',
  authMiddleware,
  validate({ params: attendeeParamsSchema }),
  getAttendeeTicketController
);

eventRouter.patch(
  '/:eventId/attendee/:attendeeId/verify',
  authMiddleware,
  validate({ params: verifyQrTokenParamsSchema }),
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  verifyQrController
);

eventRouter.get(
  '/:eventId/attendee/qr/:qrToken',
  authMiddleware,
  validate({ params: qrTokenSchema }),
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  scanTicketController
);

eventRouter.get(
  '/:eventId/attendee/:userId/allowStatus',
  authMiddleware,
  validate({ params: eventParamsSchema }),
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  getAllowAttendeeController
);

eventRouter.patch(
  '/:eventId/attendee/allowStatus',
  authMiddleware,
  validate({ params: eventParamsSchema }),
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  updateAttendeeStatusController
);

eventRouter.delete(
  '/:eventId/attendee',
  authMiddleware,
  validate({ params: eventParamsSchema }),
  deleteAttendeeController
);

export { eventRouter };
