import { CohostRepository } from '@/db/models/cohost';
import { Events } from '@/db/models/events';
import { Users } from '@/db/models/users';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import catchAsync from '@/utils/catchAsync';
import { addCohostSchema } from '@/validations/cohost.validation';
import { Role } from '@prisma/client';
import z from 'zod';
import { API_MESSAGES } from '../constants/apiMessages';

export const getEventHosts = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    if (!eventId) return res.status(400).json({ message: 'Event Id is required' });

    const hosts = await CohostRepository.findByEventId(eventId);

    if (!hosts) return res.status(404).json({ message: 'No hosts found' });

    return res.status(200).json({ message: 'success', hosts });
  }
);

type CreateEventHostRequest = z.infer<typeof addCohostSchema>;
export const createEventHost = catchAsync(
  async (req: AuthenticatedRequest<{}, {}, CreateEventHostRequest>, res) => {
    const { userId } = req;
    if (!userId) return res.status(400).json({ message: 'Invalid or expired token' });

    const { email, eventId, role } = req.body;

    const event = await Events.findById(eventId);
    if (!event) return res.status(404).json({ message: API_MESSAGES.EVENT.NOT_FOUND });

    const isUserMod = await CohostRepository.hasRole(eventId, userId, Role.Manager);

    if (userId !== event.creatorId || !isUserMod)
      return res
        .status(403)
        .json({ message: API_MESSAGES.COHOST.ADD.INSUFFICIENT_PERMS_MANAGER_OR_CREATOR_REQUIRED });

    const user = await Users.userExists(email);

    if (!user) return res.status(404).json({ message: API_MESSAGES.USER.NOT_FOUND });

    if (!user.is_completed)
      return res.status(400).json({ message: API_MESSAGES.USER.PROFILE_INCOMPLETE });

    const hostExists = await CohostRepository.findByUserIdAndEventId(user.id, eventId);
    if (hostExists) return res.status(400).json({ message: 'Host already exists' });
    const host = await CohostRepository.create({ eventId, userId: user.id, role });

    return res.status(201).json({ message: 'success', data: host });
  }
);

export const removeEventCohost = catchAsync(
  async (
    req: AuthenticatedRequest<
      { eventId?: string; cohostUserId?: string },
      {},
      CreateEventHostRequest
    >,
    res
  ) => {
    const userId = req.userId;
    const { eventId, cohostUserId } = req.params;

    if (!eventId || !cohostUserId)
      return res.status(400).json({ message: 'Event Id and cohost user is required' });

    if (userId === cohostUserId)
      return res.status(400).json({ message: API_MESSAGES.COHOST.REMOVE.CANNOT_REMOVE_SELF });

    const eventExists = await Events.findById(eventId);
    if (eventExists == null) return res.status(400).json({ message: API_MESSAGES.EVENT.NOT_FOUND });

    const isUserCreator = await CohostRepository.checkCreatorForEvent(userId as string, eventId);
    const isUserMod =
      (await CohostRepository.hasRole(userId as string, eventId, Role.Manager)) || isUserCreator;

    if (!isUserMod)
      return res.status(400).json({
        message: API_MESSAGES.COHOST.REMOVE.INSUFFICIENT_PERMS_MANAGER_OR_CREATOR_REQUIRED,
      });

    const isCohostCreator = await CohostRepository.checkCreatorForEvent(cohostUserId, eventId);

    if (isCohostCreator) {
      return res.status(400).json({
        message: API_MESSAGES.COHOST.REMOVE.CANNOT_REMOVE_CREATOR,
      });
    }

    const isCohostMod =
      isCohostCreator || (await CohostRepository.hasRole(cohostUserId, eventId, Role.Manager));

    if (!isUserCreator && isCohostMod)
      return res.status(400).json({
        message: API_MESSAGES.COHOST.REMOVE.INSUFFICIENT_PERMS_CREATOR_REQUIRED,
      });

    const deletedCohost = await CohostRepository.removeHost(cohostUserId, eventId);
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
