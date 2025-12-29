import { getAllStatsController } from '@/controllers/stat.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { roleMiddleware } from '@/middleware/roleMiddleware';
import { UserRole } from '@prisma/client';
import { Router } from 'express';

const statRouter: Router = Router();

statRouter.get('/', authMiddleware, roleMiddleware(UserRole.ADMIN), getAllStatsController);

export { statRouter };
