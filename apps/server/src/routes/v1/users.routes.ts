import {
  deleteUserController,
  getUserPublicController,
  getUsersStatsController,
  updateUserProfileController,
} from '@/controllers/user.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { roleMiddleware } from '@/middleware/roleMiddleware';
import { UserRole } from '@prisma/client';
import { Router } from 'express';

const userRouter: Router = Router();

userRouter.post('/profile', authMiddleware, updateUserProfileController);

userRouter.get('/stats', authMiddleware, roleMiddleware(UserRole.ADMIN), getUsersStatsController);

userRouter.get('/:username', getUserPublicController);

userRouter.delete('/', authMiddleware, deleteUserController);

export { userRouter };
