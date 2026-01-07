import { CityRepository } from '@/repositories/city.repository';
import { SuccessResponse } from '@/utils/apiResponse';
import { controller } from '@/utils/controller';
import { cityParamsSchema, cityFilterSchema } from '@/validations/city.validation';
import logger from '@/utils/logger';
import { NotFoundError } from '@/utils/apiError';

/**
 * Retrieves all cities.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A list of cities.
 */
export const getAllCitiesController = controller(cityFilterSchema, async (req, res) => {
  const filters = req.query;

  const cities = await CityRepository.findAllCities(filters);
  if (!cities) throw new NotFoundError('No cities found');
  logger.info(
    `Getting all cities in getAllCitiesController .. page: ${filters.page}, limit: ${filters.limit}`
  );
  return new SuccessResponse('success', cities).send(res);
});

/**
 * Retrieves a city by its ID.
 * @param req - The HTTP request object containing the city ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A city.
 */
export const getCityByIdController = controller(cityParamsSchema, async (req, res) => {
  const { id } = req.params;
  const city = await CityRepository.findCityById(id);

  if (!city) throw new NotFoundError(`No city found for id: ${id}`);
  logger.info(`Getting city by id ${id} in getCityByIdController ..`);
  return new SuccessResponse('success', city).send(res);
});
