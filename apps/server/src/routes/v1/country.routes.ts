import { Router } from 'express';
import {
  getAllCountriesController,
  getCountryByIdController,
} from '@/controllers/country.controller';
import authMiddleware from '@/middleware/authMiddleware';

const countryRouter: Router = Router();

countryRouter.get('/', authMiddleware, getAllCountriesController);

countryRouter.get('/:id', authMiddleware, getCountryByIdController);

export { countryRouter };
