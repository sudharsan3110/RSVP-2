import {
  addEventHostController,
  getEventHostController,
  removeEventCohostController,
} from '@/controllers/cohost.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { eventManageMiddleware } from '@/middleware/hostMiddleware';
import { HostRole } from '@prisma/client';
import { Router } from 'express';

const cohostRouter: Router = Router();

cohostRouter.get(
  '/events/:eventId',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
  getEventHostController
);

cohostRouter.delete(
  '/events/:eventId/:userId',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
  removeEventCohostController
);

cohostRouter.post(
  '/',
  authMiddleware,
  eventManageMiddleware([HostRole.CREATOR]),
  addEventHostController
);

export { cohostRouter };
