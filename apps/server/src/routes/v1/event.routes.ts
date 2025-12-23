import {
  cancelEventController,
  createAttendeeController,
  createEventController,
  createInvitesController,
  deleteAttendeeController,
  deleteEventController,
  filterEventController,
  getAttendeeController,
  getAttendeeTicketController,
  getEventByIdController,
  getEventBySlugController,
  getEventsStatsController,
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
import { HostRole, UserRole } from '@prisma/client';
import { roleMiddleware } from '@/middleware/roleMiddleware';

const eventRouter: Router = Router();

eventRouter.get('/upload-image', uploadEventImageController);

eventRouter.get('/', filterEventController);

eventRouter.get('/slug/:slug', getEventBySlugController);

eventRouter.post('/', authMiddleware, createEventController);
eventRouter.get('/upcoming', authMiddleware, getUserUpcomingEventController);

eventRouter.get('/popular', getPopularEventController);

eventRouter.get('/user', authMiddleware, getplannedByUserController);

eventRouter.get('/stats', authMiddleware, roleMiddleware(UserRole.ADMIN), getEventsStatsController);

eventRouter.get('/:eventId', authMiddleware, getEventByIdController);

eventRouter.patch(
  '/:eventId',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR]),
  updateEventController
);

eventRouter.patch(
  '/:eventId/cancel',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR]),
  cancelEventController
);

eventRouter.delete(
  '/:eventId',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR]),
  deleteEventController
);

eventRouter.patch(
  '/:eventId/slug',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
  updateEventSlugController
);

eventRouter.post('/:eventId/attendees', authMiddleware, createAttendeeController);

eventRouter.post(
  '/:eventId/invites',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
  createInvitesController
);

eventRouter.get(
  '/:eventId/attendees',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
  getAttendeeController
);

eventRouter.get(
  '/:eventId/attendees/excel',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
  getExcelSheetController
);

eventRouter.post(
  '/:eventId/communications',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
  sendMessageController
);

eventRouter.get('/:eventId/communications', authMiddleware, getMessageController);

eventRouter.get('/:eventId/attendees/ticket', authMiddleware, getAttendeeTicketController);

eventRouter.patch(
  '/:eventId/attendee/:attendeeId/verify',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
  verifyQrController
);

eventRouter.get(
  '/:eventId/attendee/qr/:qrToken',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
  scanTicketController
);

eventRouter.patch(
  '/:eventId/attendee/:attendeeId/status',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
  updateAttendeeStatusController
);

eventRouter.delete('/:eventId/attendee', authMiddleware, deleteAttendeeController);

export { eventRouter };
