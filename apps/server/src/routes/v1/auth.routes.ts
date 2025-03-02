import { me, signin, verifySignin, logout } from '@/controllers/auth.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validate';
import { SigninSchema, verifySigninSchema } from '@/validations/auth.validation';
import { Router } from 'express';
import { apiLimiter } from '@/middleware/rateLimiter';

const authRouter: Router = Router();

authRouter.post('/signin', apiLimiter, validate({ body: SigninSchema }), signin);

authRouter.post('/verify-signin', apiLimiter, validate({ body: verifySigninSchema }), verifySignin);

authRouter.post('/logout', apiLimiter, authMiddleware, logout);

authRouter.get('/me', apiLimiter, authMiddleware, me);

export { authRouter };
