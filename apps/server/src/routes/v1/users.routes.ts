import { Router } from 'express';
import authMiddleware from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validate';
import { profilePayloadSchema, userParamsSchema } from '@/validations/users.validation';
import {
  getUserPublicController,
  updateUserProfileController,
  deleteUserController,
} from '@/controllers/user.controller';

const userRouter: Router = Router();

userRouter.post(
  '/profile',
  authMiddleware,
  validate({ body: profilePayloadSchema }),
  updateUserProfileController
);

userRouter.get('/:username', authMiddleware, getUserPublicController);

userRouter.delete(
  '/:userId',
  authMiddleware,
  validate({ params: userParamsSchema }),
  deleteUserController
);

export { userRouter };
