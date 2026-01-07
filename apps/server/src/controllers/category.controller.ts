import { controller } from '@/utils/controller';
import logger from '@/utils/logger';
import { SuccessResponse } from '@/utils/apiResponse';
import { NotFoundError } from '@/utils/apiError';
import { emptySchema } from '@/validations/common';
import { CategoryRepository } from '@/repositories/category.repository';
import { categoryParamsSchema } from '@/validations/category.validation';

export const getAllCategoryController = controller(emptySchema, async (req, res) => {
  logger.info('Getting all categories in getAllCategoryController ..');
  const categories = await CategoryRepository.findAll();

  if (!categories) throw new NotFoundError('No categories found');

  const sortedCategories = [
    ...categories.filter((c) => c.name.toLowerCase() !== 'others...'),
    ...categories.filter((c) => c.name.toLowerCase() === 'others...'),
  ];

  return new SuccessResponse('success', sortedCategories).send(res);
});

export const getCategoryByIdController = controller(categoryParamsSchema, async (req, res) => {
  logger.info('Getting category by id in getCategoryByIdController ..');
  const { id } = req.params;
  const category = await CategoryRepository.findById(id);

  if (!category) throw new NotFoundError(`No category found for id: ${id}`);
  return new SuccessResponse('success', category).send(res);
});
