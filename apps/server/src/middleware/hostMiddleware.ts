import { HostRole } from '@prisma/client';
import { CohostRepository } from '@/repositories/cohost.repository';
import catchAsync from '@/utils/catchAsync';
import { IEventIdRequest } from '@/interface/middleware';

/**
 * Middleware to check if a user has the required role to manage an event.
 * @param allowedRoles - An array of roles that are allowed to manage the event.
 * @returns A middleware function that checks the user's access to the event.
 */
export const eventManageMiddleware = (allowedRoles: HostRole[]) => {
  return catchAsync(async (req: IEventIdRequest, res, next) => {
    const userId = req.userId as string;
    const eventId = req.params.eventId || req.body.eventId;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const hasAccess = await CohostRepository.FindhostOrCohost(userId, eventId, allowedRoles, true);

    if (!hasAccess) return res.status(403).json({ message: 'Unauthorized access' });
    req.Role = hasAccess as HostRole;

    return next();
  });
};
