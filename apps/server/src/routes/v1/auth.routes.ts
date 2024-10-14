import { me, signin, verifySignin } from '@/controllers/user.controller';
import { validate } from '@/middleware/validate';
import { SigninSchema } from '@/validations/auth.validation';
import { Router } from 'express';

const authRouter: Router = Router();

authRouter.post('/signin', validate({ body: SigninSchema }), signin);

authRouter.post('/verify-signin', verifySignin);

authRouter.post('/me', me);

export { authRouter };
