import { Router } from 'express';
import authMiddleware from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validate';
import { profilePayloadSchema } from '@/validations/users.validation';
import { getUserByUserName, updateProfile } from '@/controllers/user.controller';

const userRouter: Router = Router();

userRouter.post(
  '/profile',
  authMiddleware,
  validate({ body: profilePayloadSchema }),
  updateProfile
);

userRouter.get('/:username', authMiddleware, getUserByUserName);
export { userRouter };
