import { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './users.routes';
import { eventRouter } from './event.routes';
import { cohostRouter } from './cohost.routes';

const router: Router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/event', eventRouter);
router.use('/cohosts', cohostRouter);

export { router };
