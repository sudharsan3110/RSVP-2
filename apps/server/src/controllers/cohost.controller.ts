import { Cohosts } from '@/db/models/coHosts';
import { Events } from '@/db/models/events';
import { Users } from '@/db/models/users';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import catchAsync from '@/utils/catchAsync';
import { addCohostSchema } from '@/validations/cohost.validation';
import z from 'zod';

export const getEventHosts = catchAsync(
  async (req: AuthenticatedRequest<{ eventId?: string }, {}, {}>, res) => {
    const { eventId } = req.params;
    if (!eventId) return res.status(400).json({ message: 'Event Id is required' });

    const hosts = await Cohosts.findByEventId(eventId);

    if (!hosts) return res.status(404).json({ message: 'No hosts found' });

    return res.status(200).json({ message: 'success', data: hosts });
  }
);

type CreateEventHostRequest = z.infer<typeof addCohostSchema>;
export const createEventHost = catchAsync(
  async (req: AuthenticatedRequest<{}, {}, CreateEventHostRequest>, res) => {
    const { userId } = req;
    if (!userId) return res.status(400).json({ message: 'Invalid or expired token' });

    const { email, eventId, role } = req.body;

    const event = await Events.findById(eventId);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (userId !== event.creatorId)
      return res
        .status(403)
        .json({ message: 'You are not authorized to add a cohost to this event' });

    const user = await Users.userExists(email);

    if (!user) return res.status(404).json({ message: 'User does not exists' });

    const hostExists = await Cohosts.findByUserIdAndEventId(user.id, eventId);

    if (hostExists) return res.status(400).json({ message: 'Host already exists' });

    const host = await Cohosts.create({ eventId, userId: user.id, role });

    return res.status(201).json({ message: 'success', data: host });
  }
);
