import { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './users.routes';
import { eventRouter } from './event.routes';
import { cohostRouter } from './cohost.routes';
import { stateRouter } from '../state.routes';
import { socialLinksRouter } from './socialLinks.routes';
import { countryRouter } from './country.routes';
import { categoryRouter } from './category.routes';
import { cityRouter } from './city.routes';

const router: Router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/event', eventRouter);
router.use('/cohosts', cohostRouter);
router.use('/states', stateRouter);
router.use('/countries', countryRouter);
router.use('/socials', socialLinksRouter);
router.use('/categories', categoryRouter);
router.use('/cities', cityRouter);

export { router };
