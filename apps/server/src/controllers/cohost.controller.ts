import { CohostRepository } from '@/repositories/cohost.repository';
import { EventRepository } from '@/repositories/event.repository';
import { UserRepository } from '@/repositories/user.repository';
import catchAsync from '@/utils/catchAsync';
import { addCohostSchema } from '@/validations/cohost.validation';
import { Role } from '@prisma/client';
import z from 'zod';
import { API_MESSAGES } from '../constants/apiMessages';
import { IAuthenticatedRequest } from '@/interface/middleware';
import logger from '@/utils/logger';

/**
 * Retrieves all hosts and cohosts for a specific event.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A list of hosts and cohosts for the event.
 */
export const getEventHostController = catchAsync(
  async (req: IAuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    if (!eventId) return res.status(400).json({ message: 'Event Id is required' });

    logger.info('Getting all host in getEventHostController ...');
    const hosts = await CohostRepository.findAllByEventId(eventId);
    if (!hosts) return res.status(404).json({ message: 'No hosts found' });

    return res.status(200).json({ message: 'success', hosts });
  }
);

/**
 * Adds a new cohost to an event.
 * @param req - The HTTP request object containing the cohost details in the body.
 * @param res - The HTTP response object.
 * @returns The newly created cohost object.
 */
export const addEventHostController = catchAsync(
  async (req: IAuthenticatedRequest<{}, {}, z.infer<typeof addCohostSchema>>, res) => {
    const { userId } = req;
    if (!userId) return res.status(400).json({ message: 'Invalid or expired token' });
    const { email, eventId, role } = req.body;

    const event = await EventRepository.findById(eventId);
    if (!event) return res.status(404).json({ message: API_MESSAGES.EVENT.NOT_FOUND });
    const isUserMod = await CohostRepository.FindhostOrCohost(eventId, userId, [Role.MANAGER]);

    if (userId !== event.creatorId && !isUserMod)
      return res
        .status(403)
        .json({ message: API_MESSAGES.COHOST.ADD.INSUFFICIENT_PERMS_MANAGER_OR_CREATOR_REQUIRED });

    logger.info('Getting host details in addEventHostController ...');
    const user = await UserRepository.findbyEmail(email);
    if (!user) return res.status(404).json({ message: API_MESSAGES.USER.NOT_FOUND });

    if (!user.isCompleted)
      return res.status(400).json({ message: API_MESSAGES.USER.PROFILE_INCOMPLETE });
    const hostExists = await CohostRepository.findByUserIdAndEventId(user.id, eventId);
    if (hostExists) return res.status(400).json({ message: 'Host already exists' });

    const host = await CohostRepository.create({
      eventId,
      userId: user.id,
      role: role.toUpperCase() as Role,
    });

    return res.status(201).json({ message: 'success', data: host });
  }
);

/**
 * Removes a cohost from an event.
 * @param req - The HTTP request object containing the event ID and cohost user ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A success or failure message.
 */
export const removeEventCohostController = catchAsync(
  async (
    req: IAuthenticatedRequest<
      { eventId?: string; cohostId?: string },
      {},
      z.infer<typeof addCohostSchema>
    >,
    res
  ) => {
    const { eventId, cohostId } = req.params;
    if (!eventId || !cohostId) return res.status(400).json({ message: 'Event Id and cohost user is required' });
    
    const deletedCohost = await CohostRepository.removeCoHost(cohostId, eventId);
    if (!deletedCohost) {
      return res.status(400).json({
        message: API_MESSAGES.COHOST.REMOVE.FAILED,
      });
    } else {
      return res.status(200).json({
        message: API_MESSAGES.COHOST.REMOVE.SUCCESS,
      });
    }
  }
);
