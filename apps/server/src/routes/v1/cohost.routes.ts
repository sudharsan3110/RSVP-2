import {
  addEventHostController,
  getEventHostController,
  removeEventCohostController,
} from '@/controllers/cohost.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { eventManageMiddleware } from '@/middleware/hostMiddleware';
import { validate } from '@/middleware/validate';
import { addCohostSchema } from '@/validations/cohost.validation';
import { Role } from '@prisma/client';
import { eventParamsSchema } from '@/validations/event.validation';
import { Router } from 'express';

const cohostRouter: Router = Router();

cohostRouter.get(
  '/events/:eventId',
  authMiddleware,
  eventManageMiddleware([Role.CREATOR, Role.MANAGER]),
  validate({ params: eventParamsSchema }),
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
  validate({ body: addCohostSchema }),
  addEventHostController
);

export { cohostRouter };
