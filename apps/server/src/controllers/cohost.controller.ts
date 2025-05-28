import { CohostRepository } from '@/repositories/cohost.repository';
import { EventRepository } from '@/repositories/event.repository';
import { UserRepository } from '@/repositories/user.repository';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  TokenExpiredError,
} from '@/utils/apiError';
import { SuccessResponse } from '@/utils/apiResponse';
import { controller } from '@/utils/controller';
import logger from '@/utils/logger';
import {
  addCohostSchema,
  eventParamsSchema,
  removeCohostSchema,
} from '@/validations/cohost.validation';
import { Role } from '@prisma/client';
import { API_MESSAGES } from '../constants/apiMessages';
/**
 * Retrieves all hosts and cohosts for a specific event.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A list of hosts and cohosts for the event.
 */

export const getEventHostController = controller(eventParamsSchema, async (req, res) => {
  const { eventId } = req.params;

  logger.info('Getting all host in getEventHostController ...');
  const hosts = await CohostRepository.findAllByEventId(eventId);
  if (!hosts) throw new NotFoundError('No hosts found');

  return new SuccessResponse('success', hosts).send(res);
});

/**
 * Adds a new cohost to an event.
 * @param req - The HTTP request object containing the cohost details in the body.
 * @param res - The HTTP response object.
 * @returns The newly created cohost object.
 */
export const addEventHostController = controller(addCohostSchema, async (req, res) => {
  const { userId } = req;
  if (!userId) throw new TokenExpiredError();

  const { email, eventId, role } = req.body;

  const event = await EventRepository.findById(eventId);
  if (!event) throw new NotFoundError(API_MESSAGES.EVENT.NOT_FOUND);

  const isUserMod = await CohostRepository.FindhostOrCohost(userId, eventId, [Role.MANAGER]);
  if (userId !== event.creatorId && !isUserMod)
    throw new ForbiddenError(
      API_MESSAGES.COHOST.ADD.INSUFFICIENT_PERMS_MANAGER_OR_CREATOR_REQUIRED
    );

  logger.info('Getting host details in addEventHostController ...');
  const user = await UserRepository.findbyEmail(email);
  if (!user) throw new NotFoundError(API_MESSAGES.USER.NOT_FOUND);

  if (!user.isCompleted) throw new BadRequestError(API_MESSAGES.USER.PROFILE_INCOMPLETE);
  const hostExists = await CohostRepository.findByUserIdAndEventId(user.id, eventId);
  if (hostExists) throw new BadRequestError('Host already exists');

  const host = await CohostRepository.create({
    eventId,
    userId: user.id,
    role: role.toUpperCase() as Role,
  });

  return new SuccessResponse('success', host).send(res);
});

/**
 * Removes a cohost from an event.
 * @param req - The HTTP request object containing the event ID and cohost user ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A success or failure message.
 */
export const removeEventCohostController = controller(removeCohostSchema, async (req, res) => {
  const userId = req.userId;
  const { eventId, cohostId } = req.params;
  const userRole = req.Role;

  const cohostRole = await CohostRepository.FindhostOrCohost(
    cohostId,
    eventId,
    [Role.MANAGER, Role.CREATOR],
    true
  );

  if (cohostRole === Role.CREATOR)
    throw new BadRequestError(API_MESSAGES.COHOST.REMOVE.CANNOT_REMOVE_CREATOR);

  if (userId === cohostId) throw new BadRequestError(API_MESSAGES.COHOST.REMOVE.CANNOT_REMOVE_SELF);

  if (cohostRole === Role.MANAGER && userRole === Role.MANAGER)
    throw new BadRequestError(
      API_MESSAGES.COHOST.REMOVE.INSUFFICIENT_PERMS_MANAGER_OR_CREATOR_REQUIRED
    );

  const deletedCohost = await CohostRepository.removeCoHost(cohostId, eventId);
  if (!deletedCohost) {
    throw new BadRequestError(API_MESSAGES.COHOST.REMOVE.FAILED);
  } else {
    return new SuccessResponse(API_MESSAGES.COHOST.REMOVE.SUCCESS, deletedCohost).send(res);
  }
});
