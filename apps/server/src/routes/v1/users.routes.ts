import { updateProfile } from '@/controllers/user.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validate';
import { profilePayloadSchema } from '@/validations/users.validation';
import { Router } from 'express';

const userRouter: Router = Router();

userRouter.post(
  '/profile',
  authMiddleware,
  validate({ body: profilePayloadSchema }),
  updateProfile
);

export { userRouter };
