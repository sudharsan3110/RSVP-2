import { Events } from '@/db/models/events';
import catchAsync from '@/utils/catchAsync';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from './authMiddleware';

export type HostRole = Role | 'Admin';

export const eventManageMiddleware = (role: HostRole[]) => {
  return catchAsync(async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res, next) => {
    const eventId = req.params.eventId;
    const userId = req.userId;

    if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

    const event = await Events.findById(eventId);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    const containsAdmin = role.includes('Admin');

    if (containsAdmin && event?.creatorId === userId) return next();

    return res.status(403).json({ message: 'You are not authorized to perform this action' });
  });
};
