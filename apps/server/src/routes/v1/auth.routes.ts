import {
  getMyDataController,
  logoutController,
  signinController,
  verifySigninController,
  googleSigninController,
  googleOAuthUrlController,
} from '@/controllers/auth.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { Router } from 'express';

const authRouter: Router = Router();

authRouter.post('/signin', signinController);

authRouter.post('/google-signin', googleSigninController);

authRouter.get('/oauth/google', googleOAuthUrlController);

authRouter.post('/verify-signin', verifySigninController);

authRouter.post('/logout', authMiddleware, logoutController);

authRouter.get('/me', authMiddleware, getMyDataController);

export { authRouter };
