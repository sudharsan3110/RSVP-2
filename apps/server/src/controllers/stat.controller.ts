import { StatRepository } from '@/repositories/stat.repository';
import { TokenExpiredError } from '@/utils/apiError';
import { SuccessResponse } from '@/utils/apiResponse';
import { controller } from '@/utils/controller';
import { emptySchema } from '@/validations/common';

/**
 * Controller to retrieve system-wide statistics.
 * @param req - The HTTP request object (requires userId for authentication).
 * @param res - The HTTP response object.
 * @returns A SuccessResponse containing system-wide statistics.
 */
export const getAllStatsController = controller(emptySchema, async (req, res) => {
  const { userId } = req;
  if (!userId) throw new TokenExpiredError();

  const totalUsers = await StatRepository.getTotalUsersCount();
  const totalHosts = await StatRepository.getHostStatusCounts();

  const { totalEvents, upcomingEvents, ongoingEvents, completedEvents, totalTickets, usedTickets } =
    await StatRepository.getEventStatusCounts();

  return new SuccessResponse('success', {
    totalUsers,
    totalHosts,
    totalEvents,
    upcomingEvents,
    ongoingEvents,
    completedEvents,
    totalTickets,
    usedTickets,
  }).send(res);
});
