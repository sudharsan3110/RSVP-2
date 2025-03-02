import { Router } from 'express';
import authMiddleware from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validate';
import { profilePayloadSchema } from '@/validations/users.validation';
import { getUserByUserName, updateProfile } from '@/controllers/user.controller';
import { apiLimiter } from '@/middleware/rateLimiter';

const userRouter: Router = Router();

userRouter.post(
  '/profile',
  apiLimiter,
  authMiddleware,
  validate({ body: profilePayloadSchema }),
  updateProfile
);

userRouter.get('/:username', apiLimiter, authMiddleware, getUserByUserName);
export { userRouter };
