import {
  cancelEventController,
  createAttendeeController,
  createEventController,
  deleteAttendeeController,
  deleteEventController,
  filterEventController,
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

import { Router } from 'express';

import {
  getMessageController,
  sendMessageController,
  uploadEventImageController,
} from '@/controllers/update.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { eventManageMiddleware } from '@/middleware/hostMiddleware';
import { Role } from '@prisma/client';

const eventRouter: Router = Router();

eventRouter.get('/upload-image', uploadEventImageController);

eventRouter.get('/', filterEventController);

eventRouter.get('/slug/:slug', getEventBySlugController);

eventRouter.post('/', authMiddleware, createEventController);
eventRouter.get('/upcoming', authMiddleware, getUserUpcomingEventController);

eventRouter.get('/popular', getPopularEventController);

eventRouter.get('/user', authMiddleware, getplannedByUserController);

eventRouter.get('/:eventId', authMiddleware, getEventByIdController);

eventRouter.patch(
  '/:eventId',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR]),
  updateEventController
);

eventRouter.patch(
  '/:eventId/cancel',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR]),
  cancelEventController
);

eventRouter.delete(
  '/:eventId',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR]),
  deleteEventController
);

eventRouter.patch(
  '/:eventId/slug',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  updateEventSlugController
);

eventRouter.post('/:eventId/attendees', authMiddleware, createAttendeeController);

eventRouter.get(
  '/:eventId/attendees',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  getAttendeeController
);

eventRouter.get(
  '/:eventId/attendees/excel',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  getExcelSheetController
);

eventRouter.post(
  '/:eventId/communications',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  sendMessageController
);

eventRouter.get('/:eventId/communications', authMiddleware, getMessageController);

eventRouter.get('/:eventId/attendees/ticket', authMiddleware, getAttendeeTicketController);

eventRouter.patch(
  '/:eventId/attendee/:attendeeId/verify',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  verifyQrController
);

eventRouter.get(
  '/:eventId/attendee/qr/:qrToken',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  scanTicketController
);

eventRouter.patch(
  '/:eventId/attendee/:attendeeId/status',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  updateAttendeeStatusController
);

eventRouter.delete('/:eventId/attendee', authMiddleware, deleteAttendeeController);

export { eventRouter };
