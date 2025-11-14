import { CohostRepository } from '@/repositories/cohost.repository';
import { EventRepository } from '@/repositories/event.repository';
import { UserRepository } from '@/repositories/user.repository';
import { BadRequestError, NotFoundError, TokenExpiredError } from '@/utils/apiError';
import { SuccessResponse } from '@/utils/apiResponse';
import { controller } from '@/utils/controller';
import { HostRole } from '@prisma/client';
import {
  addCelebritySchema,
  eventIdParamsSchema,
  removeCelebrityParamsSchema,
} from '@/validations/celebrity.validation';

export const getCelebritiesByEventIdController = controller(
  eventIdParamsSchema,
  async (req, res) => {
    const { eventId } = req.params;
    const celebrities = await CohostRepository.findAllByEventId(eventId);
    const filteredCelebrities = celebrities.filter((host) => host.role === HostRole.CELEBRITY);
    return new SuccessResponse('success', filteredCelebrities).send(res);
  }
);

export const addCelebrityController = controller(addCelebritySchema, async (req, res) => {
  const { userId: actingUserId } = req;
  if (!actingUserId) throw new TokenExpiredError();

  const { eventId } = req.params;
  const { userId } = req.body;

  const event = await EventRepository.findById(eventId);
  if (!event) throw new NotFoundError('Event not found');

  const user = await UserRepository.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  if (!user.isCompleted) throw new BadRequestError('User profile incomplete');

  const exists = await CohostRepository.findByUserIdAndEventId(userId, eventId);
  if (exists) throw new BadRequestError('Celebrity already added');

  const created = await CohostRepository.create({
    eventId,
    userId,
    role: HostRole.CELEBRITY,
  });
  return new SuccessResponse('success', created).send(res);
});

export const removeCelebrityController = controller(
  removeCelebrityParamsSchema,
  async (req, res) => {
    const { userId: actingUserId } = req;
    if (!actingUserId) throw new TokenExpiredError();

    const { celebrityId, eventId } = req.params;
    const removed = await CohostRepository.removeCoHost(celebrityId, eventId);
    if (!removed) throw new NotFoundError('Celebrity not found');
    return new SuccessResponse('success', { removed: true }).send(res);
  }
);
