import { me, signin, verifySignin } from '@/controllers/auth.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validate';
import { SigninSchema, verifySigninSchema } from '@/validations/auth.validation';
import { Router } from 'express';

const authRouter: Router = Router();

authRouter.post('/signin', validate({ body: SigninSchema }), signin);

authRouter.post('/verify-signin', validate({ body: verifySigninSchema }), verifySignin);

authRouter.get('/me', authMiddleware, me);

export { authRouter };
