import { Router } from 'express';
import {
  getAllCategoryController,
  getCategoryByIdController,
} from '@/controllers/category.controller';
import authMiddleware from '@/middleware/authMiddleware';

const categoryRouter: Router = Router();

categoryRouter.get('/', getAllCategoryController);

categoryRouter.get('/:id', getCategoryByIdController);

export { categoryRouter };
