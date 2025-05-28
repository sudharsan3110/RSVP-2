import {
  getMyDataController,
  logoutController,
  signinController,
  verifySigninController,
} from '@/controllers/auth.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { Router } from 'express';

const authRouter: Router = Router();

authRouter.post('/signin', signinController);

authRouter.post('/verify-signin', verifySigninController);

authRouter.post('/logout', authMiddleware, logoutController);

authRouter.get('/me', authMiddleware, getMyDataController);

export { authRouter };
