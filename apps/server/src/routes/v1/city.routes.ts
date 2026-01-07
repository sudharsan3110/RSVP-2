import { Router } from 'express';

import authMiddleware from '@/middleware/authMiddleware';
import { getAllCitiesController, getCityByIdController } from '@/controllers/city.controller';

const cityRouter: Router = Router();

cityRouter.get('/', authMiddleware, getAllCitiesController);

cityRouter.get('/:id', authMiddleware, getCityByIdController);

export { cityRouter };
