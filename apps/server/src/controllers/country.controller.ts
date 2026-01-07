import { CountryRepository } from '@/repositories/country.repository';
import { SuccessResponse } from '@/utils/apiResponse';
import { controller } from '@/utils/controller';
import { countryParamsSchema } from '@/validations/country.valdiation';
import { emptySchema } from '@/validations/common';
import logger from '@/utils/logger';
import { NotFoundError } from '@/utils/apiError';

/**
 * Retrieves all countries.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A list of countries.
 */
export const getAllCountriesController = controller(emptySchema, async (req, res) => {
  logger.info('Getting all countries in getAllCountriesController ..');
  const countries = await CountryRepository.findAll();

  if (!countries) throw new NotFoundError('No countries found');
  return new SuccessResponse('success', countries).send(res);
});

/**
 * Retrieves a country by its ID.
 * @param req - The HTTP request object containing the country ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A country.
 */
export const getCountryByIdController = controller(countryParamsSchema, async (req, res) => {
  logger.info('Getting country by id in getCountryByIdController ..');
  const { id } = req.params;
  const country = await CountryRepository.findById(id);

  if (!country) throw new NotFoundError(`No country found for id: ${id}`);
  return new SuccessResponse('success', country).send(res);
});
