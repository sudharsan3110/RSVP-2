import { Role } from '@prisma/client';
import { CohostRepository } from '@/db/models/cohost';
import { AuthenticatedRequest } from './authMiddleware';
import catchAsync from '@/utils/catchAsync';

interface EventIdRequest
  extends AuthenticatedRequest<{ eventId?: string }, {}, { eventId?: string }> {}

export const eventManageMiddleware = (allowedRoles: Role[]) => {
  return catchAsync(async (req: EventIdRequest, res, next) => {
    const userId = req.userId as string;
    const eventId = req.params.eventId || req.body.eventId;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const hasAccess = await CohostRepository.checkHostForEvent(userId, eventId, allowedRoles);

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Unauthorized access',
      });
    }
    return next();
  });
};
