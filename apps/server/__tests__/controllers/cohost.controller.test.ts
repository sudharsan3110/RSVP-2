import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Response, NextFunction } from 'express';
import {
  addEventHostController,
  getEventHostController,
  removeEventCohostController,
} from '@/controllers/cohost.controller';
import { CohostRepository } from '@/repositories/cohost.repository';
import { EventRepository } from '@/repositories/event.repository';
import { UserRepository } from '@/repositories/user.repository';
import { API_MESSAGES } from '@/constants/apiMessages';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  TokenExpiredError,
} from '@/utils/apiError';
import type { IAuthenticatedRequest } from '@/interface/middleware';
import { HostRole } from '@prisma/client';

const EVENT_ID = '6f1d1a0e-8e8c-4d1f-9e0e-1234567890ab';
const COHOST_ID = '12b7b5ad-5678-4f89-b9a2-0a0f0c0e0c0f';
const CREATOR_ID = 'd74a3f20-2b68-40c2-b5d0-7a8c916f9d65';
const MANAGER_ID = '06c8b20c-bf5b-465f-8fcb-4f64a1ad8b45';
const NEW_USER_ID = '8cd61ca6-5a5c-4a9e-9f9f-b94d5346f9d7';

type TestRequest = IAuthenticatedRequest<any, any, any, any>;

const createMockRequest = (overrides: Partial<TestRequest> = {}): TestRequest =>
  ({
    params: {},
    body: {},
    query: {},
    ...overrides,
  }) as TestRequest;

const createMockResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    locals: {},
  };
  return res as unknown as Response;
};

const createMockNext = () => vi.fn<Parameters<NextFunction>, void>();

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getEventHostController', () => {
  it('returns host list when repository resolves data', async () => {
    const req = createMockRequest({ params: { eventId: EVENT_ID } });
    const res = createMockResponse();
    const next = createMockNext();
    const hosts = [{ id: 'host-1' }];

    vi.spyOn(CohostRepository, 'findAllByEventId').mockResolvedValue(hosts as any);

    await getEventHostController(req, res, next);

    expect(CohostRepository.findAllByEventId).toHaveBeenCalledWith(EVENT_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: hosts,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('bubbles NotFoundError through next when repository returns null', async () => {
    const req = createMockRequest({ params: { eventId: EVENT_ID } });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(CohostRepository, 'findAllByEventId').mockResolvedValue(null as any);

    await getEventHostController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0] as NotFoundError;
    expect(error.message).toBe('No hosts found');
  });

  it('short-circuits with 400 when validation fails', async () => {
    const req = createMockRequest({ params: { eventId: 'not-a-uuid' } });
    const res = createMockResponse();
    const next = createMockNext();
    const repoSpy = vi.spyOn(CohostRepository, 'findAllByEventId');

    await getEventHostController(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid request',
      })
    );
    expect(repoSpy).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});

describe('addEventHostController', () => {
  const baseBody = { eventId: EVENT_ID, email: 'cohost@example.com', role: 'Manager' as const };

  it('creates a cohost when creator sends valid payload', async () => {
    const req = createMockRequest({ userId: CREATOR_ID, body: baseBody });
    const res = createMockResponse();
    const next = createMockNext();
    const createdHost = {
      id: 'host-1',
      eventId: EVENT_ID,
      userId: NEW_USER_ID,
      role: HostRole.MANAGER,
    };

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      creatorId: CREATOR_ID,
    } as any);
    const permissionSpy = vi.spyOn(CohostRepository, 'FindhostOrCohost').mockResolvedValue(false);
    vi.spyOn(UserRepository, 'findbyEmail').mockResolvedValue({
      id: NEW_USER_ID,
      isCompleted: true,
    } as any);
    vi.spyOn(CohostRepository, 'findByUserIdAndEventId').mockResolvedValue(null);
    const createSpy = vi.spyOn(CohostRepository, 'create').mockResolvedValue(createdHost as any);

    await addEventHostController(req, res, next);

    expect(EventRepository.findById).toHaveBeenCalledWith(EVENT_ID);
    expect(permissionSpy).toHaveBeenCalledWith(CREATOR_ID, EVENT_ID, [HostRole.MANAGER]);
    expect(UserRepository.findbyEmail).toHaveBeenCalledWith(baseBody.email);
    expect(CohostRepository.findByUserIdAndEventId).toHaveBeenCalledWith(NEW_USER_ID, EVENT_ID);
    expect(createSpy).toHaveBeenCalledWith({
      eventId: EVENT_ID,
      userId: NEW_USER_ID,
      role: HostRole.MANAGER,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: createdHost,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next with TokenExpiredError when request lacks userId', async () => {
    const req = createMockRequest({ body: baseBody });
    const res = createMockResponse();
    const next = createMockNext();
    const eventSpy = vi.spyOn(EventRepository, 'findById').mockResolvedValue(null);

    await addEventHostController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(TokenExpiredError));
    expect(eventSpy).not.toHaveBeenCalled();
  });

  it('calls next with NotFoundError when event is missing', async () => {
    const req = createMockRequest({ userId: CREATOR_ID, body: baseBody });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue(null);

    await addEventHostController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0] as NotFoundError;
    expect(error.message).toBe(API_MESSAGES.EVENT.NOT_FOUND);
  });

  it('rejects managers without permissions', async () => {
    const req = createMockRequest({ userId: MANAGER_ID, body: baseBody });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      creatorId: CREATOR_ID,
    } as any);
    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockResolvedValue(false);

    await addEventHostController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    const error = next.mock.calls[0][0] as ForbiddenError;
    expect(error.message).toBe(
      API_MESSAGES.COHOST.ADD.INSUFFICIENT_PERMS_MANAGER_OR_CREATOR_REQUIRED
    );
  });

  it('bubbles NotFoundError when invitee email is unknown', async () => {
    const req = createMockRequest({ userId: CREATOR_ID, body: baseBody });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      creatorId: CREATOR_ID,
    } as any);
    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockResolvedValue(false);
    vi.spyOn(UserRepository, 'findbyEmail').mockResolvedValue(null);

    await addEventHostController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0][0] as NotFoundError;
    expect(error.message).toBe(API_MESSAGES.USER.NOT_FOUND);
  });

  it('rejects users with incomplete profiles', async () => {
    const req = createMockRequest({ userId: CREATOR_ID, body: baseBody });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      creatorId: CREATOR_ID,
    } as any);
    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockResolvedValue(false);
    vi.spyOn(UserRepository, 'findbyEmail').mockResolvedValue({
      id: NEW_USER_ID,
      isCompleted: false,
    } as any);

    await addEventHostController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0][0] as BadRequestError;
    expect(error.message).toBe(API_MESSAGES.USER.PROFILE_INCOMPLETE);
  });

  it('rejects duplicate host assignments', async () => {
    const req = createMockRequest({ userId: CREATOR_ID, body: baseBody });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      creatorId: CREATOR_ID,
    } as any);
    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockResolvedValue(false);
    vi.spyOn(UserRepository, 'findbyEmail').mockResolvedValue({
      id: NEW_USER_ID,
      isCompleted: true,
    } as any);
    vi.spyOn(CohostRepository, 'findByUserIdAndEventId').mockResolvedValue({
      id: 'existing',
    } as any);
    const createSpy = vi.spyOn(CohostRepository, 'create');

    await addEventHostController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0][0] as BadRequestError;
    expect(error.message).toBe('Host already exists');
    expect(createSpy).not.toHaveBeenCalled();
  });
});

describe('removeEventCohostController', () => {
  const baseParams = { eventId: EVENT_ID, cohostId: COHOST_ID };

  it('soft-deletes cohost and returns success response', async () => {
    const req = createMockRequest({
      userId: CREATOR_ID,
      Role: HostRole.CREATOR,
      params: baseParams,
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockResolvedValue(HostRole.MANAGER);
    vi.spyOn(CohostRepository, 'removeCoHost').mockResolvedValue(true);

    await removeEventCohostController(req, res, next);

    expect(CohostRepository.FindhostOrCohost).toHaveBeenCalledWith(
      COHOST_ID,
      EVENT_ID,
      [HostRole.MANAGER, HostRole.CREATOR],
      true
    );
    expect(CohostRepository.removeCoHost).toHaveBeenCalledWith(COHOST_ID, EVENT_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: API_MESSAGES.COHOST.REMOVE.SUCCESS,
        data: true,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks attempts to remove the creator', async () => {
    const req = createMockRequest({
      userId: CREATOR_ID,
      Role: HostRole.CREATOR,
      params: baseParams,
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockResolvedValue(HostRole.CREATOR);
    const removeSpy = vi.spyOn(CohostRepository, 'removeCoHost');

    await removeEventCohostController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0][0] as BadRequestError;
    expect(error.message).toBe(API_MESSAGES.COHOST.REMOVE.CANNOT_REMOVE_CREATOR);
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('blocks users from removing themselves', async () => {
    const req = createMockRequest({
      userId: COHOST_ID,
      Role: HostRole.CREATOR,
      params: baseParams,
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockResolvedValue(HostRole.MANAGER);
    const removeSpy = vi.spyOn(CohostRepository, 'removeCoHost');

    await removeEventCohostController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0][0] as BadRequestError;
    expect(error.message).toBe(API_MESSAGES.COHOST.REMOVE.CANNOT_REMOVE_SELF);
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('blocks manager-to-manager removal attempts', async () => {
    const req = createMockRequest({
      userId: MANAGER_ID,
      Role: HostRole.MANAGER,
      params: baseParams,
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockResolvedValue(HostRole.MANAGER);
    const removeSpy = vi.spyOn(CohostRepository, 'removeCoHost');

    await removeEventCohostController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0][0] as BadRequestError;
    expect(error.message).toBe(
      API_MESSAGES.COHOST.REMOVE.INSUFFICIENT_PERMS_MANAGER_OR_CREATOR_REQUIRED
    );
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('bubbles failure when deletion returns false', async () => {
    const req = createMockRequest({
      userId: CREATOR_ID,
      Role: HostRole.CREATOR,
      params: baseParams,
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockResolvedValue(HostRole.MANAGER);
    vi.spyOn(CohostRepository, 'removeCoHost').mockResolvedValue(false);

    await removeEventCohostController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0][0] as BadRequestError;
    expect(error.message).toBe(API_MESSAGES.COHOST.REMOVE.FAILED);
  });
});
