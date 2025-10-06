import { controller } from '@/utils/controller';
import { stateByIdSchema, stateByCountryIdSchema } from '@/validations/state.validation';
import { StateRepository } from '@/repositories/state.repository';
import { NotFoundError } from '@/utils/apiError';
import { SuccessResponse } from '@/utils/apiResponse';
import logger from '@/utils/logger';

/**
 * Retrieves a state by its ID.
 * @param req - The HTTP request object containing the state ID in the parameters.
 * @param res - The HTTP response object.
 * @returns The state object for the given state ID if found, otherwise throws a NotFoundError.
 */
export const getStateByIdController = controller(stateByIdSchema, async (req, res) => {
  const { stateId } = req.params;

  logger.info('Getting state by id in getStateByIdController ..');
  const state = await StateRepository.findStateById(stateId);
  if (!state) throw new NotFoundError('State not found for given state id');

  return new SuccessResponse('success', state).send(res);
});

/**
 * Retrieves a state by its country ID.
 * @param req - The HTTP request object containing the country ID in the parameters.
 * @param res - The HTTP response object.
 * @returns All the state objects for the given country ID if found, otherwise throws a NotFoundError.
 */
export const getStateByCountryIdController = controller(
  stateByCountryIdSchema,
  async (req, res) => {
    const { countryId } = req.params;

    logger.info('Getting state by country id in getStateByCountryIdController ..');
    const state = await StateRepository.findStateByCountryId(countryId);
    if (!state.length) throw new NotFoundError('State not found for given country id');

    return new SuccessResponse('success', state).send(res);
  }
);
