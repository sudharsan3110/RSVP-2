import {
  deleteUserController,
  getUserPublicController,
  updateUserProfileController,
} from '@/controllers/user.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { Router } from 'express';

const userRouter: Router = Router();

userRouter.post('/profile', authMiddleware, updateUserProfileController);

userRouter.get('/:username', getUserPublicController);

userRouter.delete('/', authMiddleware, deleteUserController);

export { userRouter };
