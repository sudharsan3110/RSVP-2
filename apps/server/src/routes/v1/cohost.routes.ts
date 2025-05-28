import {
  addEventHostController,
  getEventHostController,
  removeEventCohostController,
} from '@/controllers/cohost.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { eventManageMiddleware } from '@/middleware/hostMiddleware';
import { Role } from '@prisma/client';
import { Router } from 'express';

const cohostRouter: Router = Router();

cohostRouter.get(
  '/events/:eventId',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  getEventHostController
);

cohostRouter.delete(
  '/events/:eventId/:cohostId',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  removeEventCohostController
);

cohostRouter.post(
  '/',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  addEventHostController
);

export { cohostRouter };
