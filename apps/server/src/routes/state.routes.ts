import { Router } from 'express';
import authMiddleware from '@/middleware/authMiddleware';
import {
  getStateByIdController,
  getStateByCountryIdController,
} from '@/controllers/state.controller';
const stateRouter: Router = Router();

stateRouter.get('/:stateId', authMiddleware, getStateByIdController);
stateRouter.get('/country/:countryId', authMiddleware, getStateByCountryIdController);

export { stateRouter };
