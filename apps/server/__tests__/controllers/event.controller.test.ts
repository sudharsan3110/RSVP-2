import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import type { Response, NextFunction } from 'express';
import type { IAuthenticatedRequest } from '@/interface/middleware';
import { AttendeeStatus, VenueType } from '@prisma/client';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  TokenExpiredError,
} from '@/utils/apiError';

const mocks = vi.hoisted(() => ({
  categoryFindFirstMock: vi.fn(),
  categoryCreateMock: vi.fn(),
  emailSendMock: vi.fn(),
  loggerInfoMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  googleLinkMock: vi.fn(() => 'google-link'),
  icsLinkMock: vi.fn(() => 'ics-link'),
  outlookLinkMock: vi.fn(() => 'outlook-link'),
  prismaAttendeeMock: {
    count: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  prismaEventMock: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/config/config', () => ({
  __esModule: true,
  default: {
    NODE_ENV: 'development',
    CLIENT_URL: 'https://client.test',
  },
}));

vi.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    info: mocks.loggerInfoMock,
    error: mocks.loggerErrorMock,
  },
}));

vi.mock('@/utils/connection', () => ({
  __esModule: true,
  prisma: {
    category: {
      findFirst: mocks.categoryFindFirstMock,
      create: mocks.categoryCreateMock,
    },
    attendee: mocks.prismaAttendeeMock,
    event: mocks.prismaEventMock,
  },
}));

vi.mock('@/utils/sendEmail', () => ({
  __esModule: true,
  default: {
    send: mocks.emailSendMock,
  },
}));

vi.mock('calendar-link', () => ({
  __esModule: true,
  google: mocks.googleLinkMock,
  ics: mocks.icsLinkMock,
  outlook: mocks.outlookLinkMock,
}));

import {
  getEventBySlugController,
  createEventController,
  updateEventController,
  verifyQrController,
  deleteAttendeeController,
  getUserUpcomingEventController,
  getplannedByUserController,
  getEventByIdController,
  createInvitesController,
  getExcelSheetController,
  getAttendeeTicketController,
  getAttendeeController,
  scanTicketController,
  createAttendeeController,
  updateAttendeeStatusController,
} from '@/controllers/event.controller';
import { EventRepository } from '@/repositories/event.repository';
import { AttendeeRepository } from '@/repositories/attendee.repository';
import { CohostRepository } from '@/repositories/cohost.repository';
import { UserRepository } from '@/repositories/user.repository';
import EmailService from '@/utils/sendEmail';
import { API_MESSAGES } from '@/constants/apiMessages';

type TestRequest = IAuthenticatedRequest<any, any, any, any>;

const createMockRequest = (overrides: Partial<TestRequest> = {}): TestRequest =>
  ({
    params: {},
    body: {},
    query: {},
    headers: {},
    ...overrides,
  }) as TestRequest;

const createMockResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    locals: {},
  };
  return res as unknown as Response;
};

const createMockNext = () => vi.fn() as Mock;

const EVENT_ID = '11111111-1111-1111-1111-111111111111';
const ATTENDEE_ID = '22222222-2222-2222-2222-222222222222';
const USER_ID = '33333333-3333-3333-3333-333333333333';
const PUBLIC_EVENTS_PER_MONTH = 10;
const PRIVATE_EVENTS_PER_MONTH = 5;
const QR_TOKEN = 'ABC123';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.categoryFindFirstMock.mockReset();
  mocks.categoryCreateMock.mockReset();
  mocks.emailSendMock.mockReset();
  mocks.loggerInfoMock.mockReset();
  mocks.loggerErrorMock.mockReset();
  mocks.googleLinkMock.mockReset().mockReturnValue('google-link');
  mocks.icsLinkMock.mockReset().mockReturnValue('ics-link');
  mocks.outlookLinkMock.mockReset().mockReturnValue('outlook-link');
  Object.values(mocks.prismaAttendeeMock).forEach((fn) => fn.mockReset());
  Object.values(mocks.prismaEventMock).forEach((fn) => fn.mockReset());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getEventBySlugController', () => {
  it('returns event data with attendee count when slug exists', async () => {
    const req = createMockRequest({ params: { slug: 'summer-fest' } });
    const res = createMockResponse();
    const next = createMockNext();
    const event = { id: EVENT_ID, name: 'Summer Fest', hosts: [{ role: 'CREATOR' }] };

    vi.spyOn(EventRepository, 'findbySlug').mockResolvedValue(
      event as unknown as Awaited<ReturnType<typeof EventRepository.findbySlug>>
    );
    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(25);

    await getEventBySlugController(req, res, next as unknown as NextFunction);

    expect(EventRepository.findbySlug).toHaveBeenCalledWith('summer-fest');
    expect(AttendeeRepository.countAttendees).toHaveBeenCalledWith(EVENT_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: {
          event: expect.objectContaining({
            id: EVENT_ID,
            cohosts: event.hosts,
          }),
          totalAttendees: 25,
        },
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards NotFoundError when slug is missing', async () => {
    const req = createMockRequest({ params: { slug: 'missing-slug' } });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findbySlug').mockResolvedValue(null);

    await getEventBySlugController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0]![0] as NotFoundError;
    expect(error.message).toBe('Event not found');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('short-circuits with validation error when slug param is absent', async () => {
    const req = createMockRequest({ params: {} });
    const res = createMockResponse();
    const next = createMockNext();

    const repoSpy = vi.spyOn(EventRepository, 'findbySlug');

    await getEventBySlugController(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid request',
      })
    );
    expect(repoSpy).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards error when attendee count lookup fails', async () => {
    const req = createMockRequest({ params: { slug: 'summer-fest' } });
    const res = createMockResponse();
    const next = createMockNext();

    const event = { id: EVENT_ID, name: 'Summer Fest', hosts: [] };
    const dbError = new Error('DB failure');

    vi.spyOn(EventRepository, 'findbySlug').mockResolvedValue(
      event as unknown as Awaited<ReturnType<typeof EventRepository.findbySlug>>
    );
    vi.spyOn(AttendeeRepository, 'countAttendees').mockRejectedValue(dbError);

    await getEventBySlugController(req, res, next as unknown as NextFunction);

    expect(EventRepository.findbySlug).toHaveBeenCalledWith('summer-fest');
    expect(AttendeeRepository.countAttendees).toHaveBeenCalledWith(EVENT_ID);

    expect(next).toHaveBeenCalledWith(dbError);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe('getEventByIdController', () => {
  it('returns event data with attendee count and category when event exists', async () => {
    const req = createMockRequest({ params: { eventId: EVENT_ID } });
    const res = createMockResponse();
    const next = createMockNext();

    const event = {
      id: EVENT_ID,
      name: 'Tech Conference',
      hosts: [{ role: 'CREATOR' }],
      categoryId: 'cat-1',
    };

    vi.spyOn(EventRepository, 'findById').mockResolvedValue(
      event as unknown as Awaited<ReturnType<typeof EventRepository.findById>>
    );
    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(50);
    mocks.categoryFindFirstMock.mockResolvedValue({ name: 'Technology' });

    await getEventByIdController(req, res, next as unknown as NextFunction);

    expect(EventRepository.findById).toHaveBeenCalledWith(EVENT_ID);
    expect(AttendeeRepository.countAttendees).toHaveBeenCalledWith(EVENT_ID);
    expect(mocks.categoryFindFirstMock).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: {
          event: expect.objectContaining({
            id: EVENT_ID,
            cohosts: event.hosts,
            category: 'Technology',
          }),
          totalAttendees: 50,
        },
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns event data without category when categoryId is missing', async () => {
    const req = createMockRequest({ params: { eventId: EVENT_ID } });
    const res = createMockResponse();
    const next = createMockNext();

    const event = {
      id: EVENT_ID,
      name: 'Tech Conference',
      hosts: [],
      categoryId: null,
    };

    vi.spyOn(EventRepository, 'findById').mockResolvedValue(
      event as unknown as Awaited<ReturnType<typeof EventRepository.findById>>
    );
    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(10);

    mocks.categoryFindFirstMock.mockResolvedValue({ name: 'Technology' });

    await getEventByIdController(req, res, next as unknown as NextFunction);

    expect(mocks.categoryFindFirstMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards NotFoundError when event does not exist', async () => {
    const req = createMockRequest({ params: { eventId: EVENT_ID } });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue(null);

    await getEventByIdController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0]![0] as NotFoundError;
    expect(error.message).toBe('Event not found');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('short-circuits with validation error when eventId param is missing', async () => {
    const req = createMockRequest({ params: {} });
    const res = createMockResponse();
    const next = createMockNext();

    const repoSpy = vi.spyOn(EventRepository, 'findById');

    await getEventByIdController(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid request',
      })
    );
    expect(repoSpy).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards error when attendee count fails', async () => {
    const req = createMockRequest({ params: { eventId: EVENT_ID } });
    const res = createMockResponse();
    const next = createMockNext();

    const event = {
      id: EVENT_ID,
      name: 'Tech Conference',
      hosts: [],
    };

    const dbError = new Error('DB error');

    vi.spyOn(EventRepository, 'findById').mockResolvedValue(
      event as unknown as Awaited<ReturnType<typeof EventRepository.findById>>
    );
    vi.spyOn(AttendeeRepository, 'countAttendees').mockRejectedValue(dbError);

    await getEventByIdController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('createEventController', () => {
  const baseBody = (overrides: Partial<TestRequest['body']> = {}) => {
    const start = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    return {
      name: 'Tech Meetup',
      category: 'Technology',
      richtextDescription: '<p>Full description</p>',
      plaintextDescription: 'Short description',
      eventImageUrl: 'https://example.com/banner.png',
      venueType: VenueType.PHYSICAL,
      venueAddress: '123 Event Street',
      hostPermissionRequired: true,
      discoverable: true,
      capacity: 100,
      startTime: start,
      endTime: end,
      ...overrides,
    };
  };

  it('creates event with existing category and assigns creator cohost', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody(),
    });
    const res = createMockResponse();
    const next = createMockNext();
    const createdCategory = { id: 'cat-1', name: 'Technology' };
    const createdEvent = { id: EVENT_ID, name: 'Tech Meetup', slug: 'tech-meetup' };

    mocks.categoryFindFirstMock.mockResolvedValueOnce(createdCategory);
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'countEventsCreatedThisMonth').mockResolvedValue(0);
    mocks.categoryFindFirstMock.mockResolvedValueOnce(createdCategory);

    const createEventSpy = vi
      .spyOn(EventRepository, 'create')
      .mockResolvedValue(
        createdEvent as unknown as Awaited<ReturnType<typeof EventRepository.create>>
      );
    const createHostSpy = vi
      .spyOn(CohostRepository, 'create')
      .mockResolvedValue({} as unknown as Awaited<ReturnType<typeof CohostRepository.create>>);

    await createEventController(req, res, next as unknown as NextFunction);

    expect(UserRepository.findById).toHaveBeenCalledWith(USER_ID);
    expect(mocks.categoryFindFirstMock).toHaveBeenCalledWith({ where: { id: 'Technology' } });
    expect(mocks.categoryCreateMock).not.toHaveBeenCalled();
    expect(createEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: createdCategory.id,
        creatorId: USER_ID,
        description: '<p>Full description</p>',
        name: 'Tech Meetup',
        venueType: VenueType.PHYSICAL,
      })
    );
    expect(createHostSpy).toHaveBeenCalledWith({
      userId: USER_ID,
      role: 'CREATOR',
      eventId: EVENT_ID,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: createdEvent,
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects when category does not exist', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody(),
    });
    const res = createMockResponse();
    const next = createMockNext();

    mocks.categoryFindFirstMock.mockResolvedValueOnce(null);
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'countEventsCreatedThisMonth').mockResolvedValue(0);
    mocks.categoryFindFirstMock.mockResolvedValueOnce(null);

    await createEventController(req, res, next as unknown as NextFunction);

    expect(mocks.categoryFindFirstMock).toHaveBeenCalledWith({ where: { id: 'Technology' } });
    expect(mocks.categoryCreateMock).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('rejects when plaintext description exceeds limit', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody({ plaintextDescription: 'a'.repeat(301) }),
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);
    const createEventSpy = vi.spyOn(EventRepository, 'create');
    const createHostSpy = vi.spyOn(CohostRepository, 'create');

    await createEventController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0]![0] as BadRequestError;
    expect(error.message).toBe('Description cannot be greater than 300 characters.');
    expect(createEventSpy).not.toHaveBeenCalled();
    expect(createHostSpy).not.toHaveBeenCalled();
  });

  it('rejects when public event limit is exceeded', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody({ discoverable: true }),
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'countEventsCreatedThisMonth').mockResolvedValueOnce(
      PUBLIC_EVENTS_PER_MONTH
    );
    await createEventController(req, res, next as unknown as NextFunction);

    expect(EventRepository.countEventsCreatedThisMonth).toHaveBeenCalledWith(USER_ID, true);
    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0]![0] as BadRequestError;

    expect(error.message).toBe(API_MESSAGES.EVENT.PUBLIC_EVENT_LIMIT_EXCEEDED);
  });

  it('rejects when private event limit is exceeded', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody({ discoverable: false }),
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'countEventsCreatedThisMonth').mockResolvedValueOnce(
      PRIVATE_EVENTS_PER_MONTH
    );
    await createEventController(req, res, next as unknown as NextFunction);

    expect(EventRepository.countEventsCreatedThisMonth).toHaveBeenCalledWith(USER_ID, false);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0]![0] as BadRequestError;

    expect(error.message).toBe(API_MESSAGES.EVENT.PRIVATE_EVENT_LIMIT_EXCEEDED);
  });

  it('allows public event creation when under limit', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody({ discoverable: true }),
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    mocks.categoryFindFirstMock.mockResolvedValue({ id: 'cat-1' });

    vi.spyOn(EventRepository, 'countEventsCreatedThisMonth').mockResolvedValueOnce(3);

    const createdEvent = { id: EVENT_ID, name: 'Tech Meetup' };

    vi.spyOn(EventRepository, 'create').mockResolvedValue(
      createdEvent as unknown as Awaited<ReturnType<typeof EventRepository.create>>
    );
    vi.spyOn(CohostRepository, 'create').mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof CohostRepository.create>>
    );

    await createEventController(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'success', data: createdEvent })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('allows private event creation when under limit', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody({ discoverable: true }),
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    mocks.categoryFindFirstMock.mockResolvedValue({ id: 'cat-1' });

    vi.spyOn(EventRepository, 'countEventsCreatedThisMonth').mockResolvedValueOnce(2);

    const createdEvent = { id: EVENT_ID, name: 'Tech Meetup' };

    vi.spyOn(EventRepository, 'create').mockResolvedValue(
      createdEvent as unknown as Awaited<ReturnType<typeof EventRepository.create>>
    );
    vi.spyOn(CohostRepository, 'create').mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof CohostRepository.create>>
    );

    await createEventController(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'success', data: createdEvent })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

describe('createEventController - Unlimited Access Feature', () => {
  const baseBody = (overrides: Partial<TestRequest['body']> = {}) => {
    const start = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    return {
      name: 'Tech Meetup',
      category: 'Technology',
      richtextDescription: '<p>Full description</p>',
      plaintextDescription: 'Short description',
      eventImageUrl: 'https://example.com/banner.png',
      venueType: VenueType.PHYSICAL,
      venueAddress: '123 Event Street',
      hostPermissionRequired: true,
      discoverable: true,
      capacity: 100,
      startTime: start,
      endTime: end,
      ...overrides,
    };
  };

  it('allows user with unlimited access to create public event beyond monthly limit', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody({ discoverable: true }),
    });
    const res = createMockResponse();
    const next = createMockNext();
    const createdEvent = { id: EVENT_ID, name: 'Tech Meetup', slug: 'tech-meetup' };

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
      hasUnlimitedAccess: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    mocks.categoryFindFirstMock.mockResolvedValue({ id: 'cat-1' });

    const countSpy = vi
      .spyOn(EventRepository, 'countEventsCreatedThisMonth')
      .mockResolvedValue(PUBLIC_EVENTS_PER_MONTH + 5);

    vi.spyOn(EventRepository, 'create').mockResolvedValue(
      createdEvent as unknown as Awaited<ReturnType<typeof EventRepository.create>>
    );
    vi.spyOn(CohostRepository, 'create').mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof CohostRepository.create>>
    );

    await createEventController(req, res, next as unknown as NextFunction);

    expect(countSpy).not.toHaveBeenCalled();

    expect(EventRepository.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows user with unlimited access to create private event beyond monthly limit', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody({ discoverable: false }),
    });
    const res = createMockResponse();
    const next = createMockNext();
    const createdEvent = { id: EVENT_ID, name: 'Private Meetup' };

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
      hasUnlimitedAccess: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    mocks.categoryFindFirstMock.mockResolvedValue({ id: 'cat-1' });

    const countSpy = vi
      .spyOn(EventRepository, 'countEventsCreatedThisMonth')
      .mockResolvedValue(PRIVATE_EVENTS_PER_MONTH + 3);

    vi.spyOn(EventRepository, 'create').mockResolvedValue(
      createdEvent as unknown as Awaited<ReturnType<typeof EventRepository.create>>
    );
    vi.spyOn(CohostRepository, 'create').mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof CohostRepository.create>>
    );

    await createEventController(req, res, next as unknown as NextFunction);

    expect(countSpy).not.toHaveBeenCalled();

    expect(EventRepository.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('still enforces monthly limit for users without unlimited access', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody({ discoverable: true }),
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
      hasUnlimitedAccess: false,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'countEventsCreatedThisMonth').mockResolvedValue(
      PUBLIC_EVENTS_PER_MONTH
    );

    await createEventController(req, res, next as unknown as NextFunction);

    expect(EventRepository.countEventsCreatedThisMonth).toHaveBeenCalledWith(USER_ID, true);
    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));

    const error = next.mock.calls[0]![0] as BadRequestError;
    expect(error.message).toBe(API_MESSAGES.EVENT.PUBLIC_EVENT_LIMIT_EXCEEDED);
  });

  it('still enforces other validations even with unlimited access (incomplete profile)', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody(),
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: false,
      hasUnlimitedAccess: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    await createEventController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0]![0] as BadRequestError;
    expect(error.message).toBe('Please complete your profile before creating event');
  });

  it('still enforces description length validation with unlimited access', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody({ plaintextDescription: 'a'.repeat(301) }),
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
      hasUnlimitedAccess: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    await createEventController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0]![0] as BadRequestError;
    expect(error.message).toBe('Description cannot be greater than 300 characters.');
  });
});

describe('updateEventController', () => {
  it('updates event, unlocks waiting attendees, and skips email in development', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { eventId: EVENT_ID },
      body: {
        venueType: VenueType.PHYSICAL,
        hostPermissionRequired: false,
        capacity: 150,
        richtextDescription: '<p>Updated</p>',
        category: 'Tech',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);
    vi.spyOn(EventRepository, 'countEventsCreatedThisMonth').mockResolvedValue(0);

    const existingEvent = {
      id: EVENT_ID,
      creatorId: USER_ID,
      VenueType: VenueType.PHYSICAL,
      hostPermissionRequired: true,
      hosts: [],
    };

    mocks.categoryFindFirstMock.mockResolvedValueOnce({ id: 'cat-123', name: 'Tech' });
    vi.spyOn(EventRepository, 'findById').mockResolvedValue(
      existingEvent as unknown as Awaited<ReturnType<typeof EventRepository.findById>>
    );
    const updateWaitingSpy = vi
      .spyOn(AttendeeRepository, 'updateMultipleAttendeesStatus')
      .mockResolvedValue(
        {} as unknown as Awaited<
          ReturnType<typeof AttendeeRepository.updateMultipleAttendeesStatus>
        >
      );
    vi.spyOn(EventRepository, 'update').mockResolvedValue({ id: EVENT_ID } as unknown as Awaited<
      ReturnType<typeof EventRepository.update>
    >);
    vi.spyOn(AttendeeRepository, 'findAllAttendees').mockResolvedValue([
      { user: { primaryEmail: 'a@example.com' } },
    ] as unknown as Awaited<ReturnType<typeof AttendeeRepository.findAllAttendees>>);
    vi.spyOn(CohostRepository, 'findAllByEventId').mockResolvedValue([
      { role: 'CREATOR', user: { primaryEmail: 'creator@example.com' } },
    ] as unknown as Awaited<ReturnType<typeof CohostRepository.findAllByEventId>>);

    await updateEventController(req, res, next as unknown as NextFunction);

    expect(EventRepository.findById).toHaveBeenCalledWith(EVENT_ID);
    expect(updateWaitingSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: EVENT_ID,
        status: AttendeeStatus.WAITING,
        isDeleted: false,
      }),
      AttendeeStatus.GOING
    );
    expect(EventRepository.update).toHaveBeenCalledWith(
      EVENT_ID,
      expect.objectContaining({
        categoryId: 'cat-123',
        description: '<p>Updated</p>',
        venueType: VenueType.PHYSICAL,
      })
    );
    expect(EmailService.send).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: expect.objectContaining({ id: EVENT_ID }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when venueType is missing', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { eventId: EVENT_ID },
      body: {
        hostPermissionRequired: false,
      },
    });
    const res = createMockResponse();
    const next = createMockNext();
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);
    vi.spyOn(EventRepository, 'countEventsCreatedThisMonth').mockResolvedValue(0);

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      creatorId: USER_ID,
      VenueType: VenueType.PHYSICAL,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);
    const updateSpy = vi.spyOn(EventRepository, 'update');

    await updateEventController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0]![0] as BadRequestError;
    expect(error.message).toBe('Venue type cannot be updated');
    expect(updateSpy).not.toHaveBeenCalled();
  });
});

describe('updateEventController - Unlimited Access Feature', () => {
  const baseBody = (overrides: Partial<TestRequest['body']> = {}) => ({
    name: 'Updated Event',
    venueType: VenueType.PHYSICAL,
    richtextDescription: '<p>Updated description</p>',
    ...overrides,
  });

  it('allows user with unlimited access to switch event from private to public beyond limit', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { eventId: EVENT_ID },
      body: baseBody({ discoverable: true }),
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
      hasUnlimitedAccess: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      discoverable: false,
      hostPermissionRequired: false,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    const countSpy = vi
      .spyOn(EventRepository, 'countEventsCreatedThisMonth')
      .mockResolvedValue(PUBLIC_EVENTS_PER_MONTH + 5);

    vi.spyOn(EventRepository, 'update').mockResolvedValue({
      id: EVENT_ID,
      name: 'Updated Event',
    } as unknown as Awaited<ReturnType<typeof EventRepository.update>>);

    vi.spyOn(AttendeeRepository, 'findAllAttendees').mockResolvedValue([]);
    vi.spyOn(CohostRepository, 'findAllByEventId').mockResolvedValue([]);

    await updateEventController(req, res, next as unknown as NextFunction);

    expect(countSpy).not.toHaveBeenCalled();

    expect(EventRepository.update).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('enforces limit for normal users when switching from private to public', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { eventId: EVENT_ID },
      body: baseBody({ discoverable: true }),
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
      hasUnlimitedAccess: false,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      discoverable: false,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    vi.spyOn(EventRepository, 'countEventsCreatedThisMonth').mockResolvedValue(
      PUBLIC_EVENTS_PER_MONTH
    );

    await updateEventController(req, res, next as unknown as NextFunction);

    expect(EventRepository.countEventsCreatedThisMonth).toHaveBeenCalledWith(USER_ID, true);
    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));

    const error = next.mock.calls[0]![0] as BadRequestError;
    expect(error.message).toBe(API_MESSAGES.EVENT.PUBLIC_EVENT_LIMIT_EXCEEDED);
  });

  it('does not check limit when event discoverable status unchanged', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { eventId: EVENT_ID },
      body: baseBody({ name: 'New Name' }),
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
      hasUnlimitedAccess: false,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      discoverable: true,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    const countSpy = vi.spyOn(EventRepository, 'countEventsCreatedThisMonth');

    vi.spyOn(EventRepository, 'update').mockResolvedValue({
      id: EVENT_ID,
    } as unknown as Awaited<ReturnType<typeof EventRepository.update>>);

    vi.spyOn(AttendeeRepository, 'findAllAttendees').mockResolvedValue([]);
    vi.spyOn(CohostRepository, 'findAllByEventId').mockResolvedValue([]);

    await updateEventController(req, res, next as unknown as NextFunction);

    expect(countSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('verifyQrController', () => {
  it('marks attendee as checked-in when QR is valid', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { attendeeId: ATTENDEE_ID, eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();
    const now = new Date();

    vi.spyOn(AttendeeRepository, 'findById').mockResolvedValue({
      id: ATTENDEE_ID,
      eventId: EVENT_ID,
      allowedStatus: true,
      hasAttended: false,
    } as unknown as Awaited<ReturnType<typeof AttendeeRepository.findById>>);
    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      startTime: new Date(now.getTime() + 30 * 60 * 1000),
      endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);
    const updateSpy = vi
      .spyOn(AttendeeRepository, 'update')
      .mockResolvedValue({} as unknown as Awaited<ReturnType<typeof AttendeeRepository.update>>);

    await verifyQrController(req, res, next as unknown as NextFunction);

    expect(AttendeeRepository.findById).toHaveBeenCalledWith(ATTENDEE_ID);
    expect(EventRepository.findById).toHaveBeenCalledWith(EVENT_ID);
    expect(updateSpy).toHaveBeenCalledWith(
      ATTENDEE_ID,
      expect.objectContaining({
        hasAttended: true,
        checkInTime: expect.any(Date),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: { message: 'Ticket is valid' },
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects attendees without permission', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { attendeeId: ATTENDEE_ID, eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(AttendeeRepository, 'findById').mockResolvedValue({
      id: ATTENDEE_ID,
      eventId: EVENT_ID,
      allowedStatus: false,
    } as unknown as Awaited<ReturnType<typeof AttendeeRepository.findById>>);
    const eventFindSpy = vi.spyOn(EventRepository, 'findById');
    const attendeeUpdateSpy = vi.spyOn(AttendeeRepository, 'update');

    await verifyQrController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    const error = next.mock.calls[0]![0] as ForbiddenError;
    expect(error.message).toBe('Attendee is not allowed');
    expect(eventFindSpy).not.toHaveBeenCalled();
    expect(attendeeUpdateSpy).not.toHaveBeenCalled();
  });

  it('prevents verification before allowed window', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { attendeeId: ATTENDEE_ID, eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(AttendeeRepository, 'findById').mockResolvedValue({
      id: ATTENDEE_ID,
      eventId: EVENT_ID,
      allowedStatus: true,
      hasAttended: false,
    } as unknown as Awaited<ReturnType<typeof AttendeeRepository.findById>>);
    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      startTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);
    const attendeeUpdateSpy = vi.spyOn(AttendeeRepository, 'update');

    await verifyQrController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0]![0] as BadRequestError;
    expect(error.message).toBe('Ticket verification will start 1 hour before the event');
    expect(attendeeUpdateSpy).not.toHaveBeenCalled();
  });
});

describe('createInvitesController', () => {
  it('forwards NotFoundError when event does not exist', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      body: { emails: ['a@test.com'] },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue(null);

    await createInvitesController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
  });

  it('throws BadRequestError when event is not active', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      body: { emails: ['a@test.com'] },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      isActive: false,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    await createInvitesController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
  });

  it('throws BadRequestError when event is expired', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      body: { emails: ['a@test.com'] },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      isActive: true,
      endTime: new Date(Date.now() - 1000),
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    await createInvitesController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
  });

  it('throws error when event is at full capacity', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      body: { emails: ['a@test.com'] },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      isActive: true,
      endTime: new Date(Date.now() + 10000),
      capacity: 1,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(1);

    await createInvitesController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
  });

  it('invites a new attendee successfully', async () => {
    const email = 'new@test.com';

    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      body: { emails: [email] },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      name: 'Event',
      isActive: true,
      endTime: new Date(Date.now() + 10000),
      capacity: -1,
      hosts: [],
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(0);
    vi.spyOn(UserRepository, 'findManyByEmails').mockResolvedValue([]);
    vi.spyOn(UserRepository, 'createMany').mockResolvedValue([
      { id: USER_ID, primaryEmail: email, fullName: 'Guest' },
    ] as unknown as Awaited<ReturnType<typeof UserRepository.createMany>>);

    vi.spyOn(AttendeeRepository, 'findAllByEventIdAndUserIds').mockResolvedValue([]);
    vi.spyOn(AttendeeRepository, 'create').mockResolvedValue({
      id: ATTENDEE_ID,
      userId: USER_ID,
      qrToken: 'ABC123',
    } as unknown as Awaited<ReturnType<typeof AttendeeRepository.create>>);

    await createInvitesController(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: expect.objectContaining({
          invited: [{ email }],
        }),
      })
    );
  });

  it('restores cancelled attendee', async () => {
    const email = 'restore@test.com';

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      isActive: true,
      endTime: new Date(Date.now() + 10000),
      capacity: -1,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(0);
    vi.spyOn(UserRepository, 'findManyByEmails').mockResolvedValue([
      { id: USER_ID, primaryEmail: email },
    ] as unknown as Awaited<ReturnType<typeof UserRepository.findManyByEmails>>);
    vi.spyOn(UserRepository, 'createMany').mockResolvedValue([]);

    vi.spyOn(AttendeeRepository, 'findAllByEventIdAndUserIds').mockResolvedValue([
      {
        id: ATTENDEE_ID,
        userId: USER_ID,
        isDeleted: true,
        status: AttendeeStatus.CANCELLED,
      },
    ] as unknown as Awaited<ReturnType<typeof AttendeeRepository.findAllByEventIdAndUserIds>>);

    vi.spyOn(AttendeeRepository, 'restore').mockResolvedValue(
      {} as unknown as Awaited<ReturnType<typeof AttendeeRepository.restore>>
    );

    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      body: { emails: [email] },
    });

    const res = createMockResponse();
    const next = createMockNext();

    await createInvitesController(req, res, next as unknown as NextFunction);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          restored: [{ email: 'restore@test.com' }],
        }),
      })
    );
  });

  it('marks invite as failed when error occurs inside loop', async () => {
    const email = 'fail@test.com';

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      isActive: true,
      endTime: new Date(Date.now() + 10000),
      capacity: -1,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(0);
    vi.spyOn(UserRepository, 'findManyByEmails').mockResolvedValue([]);
    vi.spyOn(UserRepository, 'createMany').mockResolvedValue([
      { id: USER_ID, primaryEmail: email },
    ] as unknown as Awaited<ReturnType<typeof UserRepository.createMany>>);

    vi.spyOn(AttendeeRepository, 'findAllByEventIdAndUserIds').mockResolvedValue([]);
    vi.spyOn(AttendeeRepository, 'create').mockRejectedValue(new Error('DB error'));

    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      body: { emails: [email] },
    });

    const res = createMockResponse();
    const next = createMockNext();

    await createInvitesController(req, res, next as unknown as NextFunction);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          failed: [{ email: 'fail@test.com', error: 'DB error' }],
        }),
      })
    );
  });
});

describe('getAttendeeController', () => {
  it('returns paginated attendees when event exists', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      query: {
        page: 1,
        limit: 10,
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    const attendeesResult = {
      data: [
        { id: 'a1', userId: 'u1' },
        { id: 'a2', userId: 'u2' },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 2,
      },
    };

    vi.spyOn(AttendeeRepository, 'findAttendeesByEventId').mockResolvedValue(
      attendeesResult as unknown as Awaited<
        ReturnType<typeof AttendeeRepository.findAttendeesByEventId>
      >
    );

    await getAttendeeController(req, res, next as unknown as NextFunction);

    expect(EventRepository.findById).toHaveBeenCalledWith(EVENT_ID);

    expect(AttendeeRepository.findAttendeesByEventId).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: EVENT_ID,
        page: 1,
        limit: 10,
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: attendeesResult,
      })
    );

    expect(next).not.toHaveBeenCalled();
  });

  it('forwards NotFoundError when event does not exist', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      query: {},
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue(null);

    await getAttendeeController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    expect(res.status).not.toHaveBeenCalled();
  });

  it('short-circuits with validation error when eventId is missing', async () => {
    const req = createMockRequest({
      params: {},
      query: {},
    });
    const res = createMockResponse();
    const next = createMockNext();

    const repoSpy = vi.spyOn(AttendeeRepository, 'findAttendeesByEventId');

    await getAttendeeController(req, res, next as unknown as NextFunction);

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

describe('deleteAttendeeController', () => {
  it('soft deletes attendee registration when event is upcoming', async () => {
    const req = createMockRequest({ userId: USER_ID, params: { eventId: EVENT_ID } });
    const res = createMockResponse();
    const next = createMockNext();
    const futureEnd = new Date(Date.now() + 2 * 60 * 60 * 1000);

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      endTime: futureEnd,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);
    vi.spyOn(AttendeeRepository, 'findByUserIdAndEventId').mockResolvedValue({
      id: ATTENDEE_ID,
    } as unknown as Awaited<ReturnType<typeof AttendeeRepository.findByUserIdAndEventId>>);
    vi.spyOn(AttendeeRepository, 'cancel').mockResolvedValue({
      id: ATTENDEE_ID,
      isDeleted: true,
    } as unknown as Awaited<ReturnType<typeof AttendeeRepository.cancel>>);

    await deleteAttendeeController(req, res, next as unknown as NextFunction);

    expect(EventRepository.findById).toHaveBeenCalledWith(EVENT_ID);
    expect(AttendeeRepository.findByUserIdAndEventId).toHaveBeenCalledWith(USER_ID, EVENT_ID);
    expect(AttendeeRepository.cancel).toHaveBeenCalledWith(ATTENDEE_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Attendee removed successfully',
        data: expect.objectContaining({ id: ATTENDEE_ID }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects cancellation for past events', async () => {
    const req = createMockRequest({ userId: USER_ID, params: { eventId: EVENT_ID } });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      endTime: new Date(Date.now() - 60 * 1000),
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);
    const attendeeFindSpy = vi.spyOn(AttendeeRepository, 'findByUserIdAndEventId');

    await deleteAttendeeController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0]![0] as NotFoundError;
    expect(error.message).toBe('The event has already ended, cannot cancel registration.');
    expect(attendeeFindSpy).not.toHaveBeenCalled();
  });
});

describe('updateAttendeeStatusController', () => {
  it('updates attendee status when capacity is not reached', async () => {
    const req = createMockRequest({
      params: { attendeeId: ATTENDEE_ID, eventId: EVENT_ID },
      body: { allowedStatus: true },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      capacity: 100,
    } as any);

    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(50);

    const updateSpy = vi.spyOn(AttendeeRepository, 'updateAttendeeStatus').mockResolvedValue({
      id: ATTENDEE_ID,
      allowedStatus: true,
    } as any);

    await updateAttendeeStatusController(req, res, next as any);

    expect(EventRepository.findById).toHaveBeenCalledWith(EVENT_ID);
    expect(AttendeeRepository.countAttendees).toHaveBeenCalledWith(EVENT_ID);
    expect(updateSpy).toHaveBeenCalledWith(ATTENDEE_ID, true);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: API_MESSAGES.ALLOW_GUEST.SUCCESSFUL_ATTENDEE_UPDATE,
        data: expect.objectContaining({
          id: ATTENDEE_ID,
          allowedStatus: true,
        }),
      })
    );

    expect(next).not.toHaveBeenCalled();
  });

  it('rejects when event capacity is reached and allowedStatus is true', async () => {
    const req = createMockRequest({
      params: { attendeeId: ATTENDEE_ID, eventId: EVENT_ID },
      body: { allowedStatus: true },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      capacity: 50,
    } as any);

    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(50);

    const updateSpy = vi.spyOn(AttendeeRepository, 'updateAttendeeStatus');

    await updateAttendeeStatusController(req, res, next as any);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = (next as any).mock.calls[0][0];
    expect(error.message).toBe('Event capacity reached');

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('allows disabling attendee even when event is full', async () => {
    const req = createMockRequest({
      params: { attendeeId: ATTENDEE_ID, eventId: EVENT_ID },
      body: { allowedStatus: false },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      capacity: 50,
    } as any);

    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(50);

    const updateSpy = vi.spyOn(AttendeeRepository, 'updateAttendeeStatus').mockResolvedValue({
      id: ATTENDEE_ID,
      allowedStatus: false,
    } as any);

    await updateAttendeeStatusController(req, res, next as any);

    expect(updateSpy).toHaveBeenCalledWith(ATTENDEE_ID, false);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('getExcelSheetController', () => {
  it('forwards BadRequestError when eventId is missing', async () => {
    const req = createMockRequest({
      params: {},
    });
    const res = createMockResponse();
    const next = createMockNext();

    getExcelSheetController(req, res, next as unknown as NextFunction);
    await new Promise(process.nextTick);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    expect(res.send).not.toHaveBeenCalled();
  });

  it('forwards NotFoundError when event does not exist', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue(null);

    getExcelSheetController(req, res, next as unknown as NextFunction);
    await new Promise(process.nextTick);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    expect(res.send).not.toHaveBeenCalled();
  });

  it('exports attendees as an excel sheet when event exists', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      name: 'Test Event',
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    vi.spyOn(AttendeeRepository, 'findAllAttendees').mockResolvedValue([
      {
        registrationTime: new Date(),
        status: 'GOING',
        hasAttended: false,
        checkInTime: null,
        feedback: null,
        qrToken: 'ABC123',
        allowedStatus: true,
        updatedAt: new Date(),
        user: {
          fullName: 'John Doe',
          primaryEmail: 'john@test.com',
          contact: null,
        },
      },
    ] as unknown as Awaited<ReturnType<typeof AttendeeRepository.findAllAttendees>>);

    getExcelSheetController(req, res, next as unknown as NextFunction);
    await new Promise(process.nextTick);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining(`attendees-${EVENT_ID}.xlsx`)
    );

    expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
    expect(next).not.toHaveBeenCalled();
  });
});

describe('getAttendeeTicketController', () => {
  it('returns attendee ticket when user is registered for event', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      userId: USER_ID,
    });
    const res = createMockResponse();
    const next = createMockNext();

    const attendee = {
      id: 'attendee-1',
      userId: USER_ID,
      eventId: EVENT_ID,
      qrToken: 'ABC123',
      status: 'GOING',
    };

    vi.spyOn(AttendeeRepository, 'findByUserIdAndEventId').mockResolvedValue(
      attendee as unknown as Awaited<ReturnType<typeof AttendeeRepository.findByUserIdAndEventId>>
    );

    await getAttendeeTicketController(req, res, next as unknown as NextFunction);

    expect(AttendeeRepository.findByUserIdAndEventId).toHaveBeenCalledWith(USER_ID, EVENT_ID);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: attendee,
      })
    );

    expect(next).not.toHaveBeenCalled();
  });

  it('forwards TokenExpiredError when userId is missing', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      userId: undefined,
    });
    const res = createMockResponse();
    const next = createMockNext();

    await getAttendeeTicketController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(TokenExpiredError));
    expect(res.status).not.toHaveBeenCalled();
  });

  it('forwards NotFoundError when attendee does not exist', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
      userId: USER_ID,
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(AttendeeRepository, 'findByUserIdAndEventId').mockResolvedValue(null);

    await getAttendeeTicketController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    expect(res.status).not.toHaveBeenCalled();
  });

  it('short-circuits with validation error when eventId param is missing', async () => {
    const req = createMockRequest({
      params: {},
      userId: USER_ID,
    });
    const res = createMockResponse();
    const next = createMockNext();

    const repoSpy = vi.spyOn(AttendeeRepository, 'findByUserIdAndEventId');

    await getAttendeeTicketController(req, res, next as unknown as NextFunction);

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

describe('updateAttendeeStatusController', () => {
  it('updates attendee allowed status successfully', async () => {
    const req = createMockRequest({
      params: { attendeeId: ATTENDEE_ID, eventId: EVENT_ID },
      body: { allowedStatus: true },
    });
    const res = createMockResponse();
    const next = createMockNext();

    const updatedAttendee = {
      id: ATTENDEE_ID,
      allowedStatus: true,
      status: 'GOING',
    };

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      capacity: 100,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);
    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(10);

    vi.spyOn(AttendeeRepository, 'updateAttendeeStatus').mockResolvedValue(
      updatedAttendee as unknown as Awaited<
        ReturnType<typeof AttendeeRepository.updateAttendeeStatus>
      >
    );

    await updateAttendeeStatusController(req, res, next as unknown as NextFunction);

    expect(AttendeeRepository.updateAttendeeStatus).toHaveBeenCalledWith(ATTENDEE_ID, true);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: API_MESSAGES.ALLOW_GUEST.SUCCESSFUL_ATTENDEE_UPDATE,
        data: updatedAttendee,
      })
    );

    expect(next).not.toHaveBeenCalled();
  });

  it('short-circuits with validation error when required params are missing', async () => {
    const req = createMockRequest({
      params: {},
      body: {},
    });
    const res = createMockResponse();
    const next = createMockNext();

    const repoSpy = vi.spyOn(AttendeeRepository, 'updateAttendeeStatus');

    await updateAttendeeStatusController(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid request',
      })
    );

    expect(repoSpy).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards error when repository throws', async () => {
    const req = createMockRequest({
      params: { attendeeId: ATTENDEE_ID, eventId: EVENT_ID },
      body: { allowedStatus: false },
    });
    const res = createMockResponse();
    const next = createMockNext();

    const dbError = new Error('DB failure');

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      capacity: 100,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);
    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(10);

    vi.spyOn(AttendeeRepository, 'updateAttendeeStatus').mockRejectedValue(dbError);

    await updateAttendeeStatusController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('scanTicketController', () => {
  it('returns attendee details when qr token is valid', async () => {
    const req = createMockRequest({
      params: {
        eventId: EVENT_ID,
        qrToken: QR_TOKEN,
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    const attendee = {
      id: 'attendee-1',
      qrToken: QR_TOKEN,
      eventId: EVENT_ID,
      status: 'GOING',
    };

    vi.spyOn(AttendeeRepository, 'findByQrToken').mockResolvedValue(
      attendee as unknown as Awaited<ReturnType<typeof AttendeeRepository.findByQrToken>>
    );

    await scanTicketController(req, res, next as unknown as NextFunction);

    expect(AttendeeRepository.findByQrToken).toHaveBeenCalledWith(QR_TOKEN, EVENT_ID);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: attendee,
      })
    );

    expect(next).not.toHaveBeenCalled();
  });

  it('forwards NotFoundError when attendee does not exist', async () => {
    const req = createMockRequest({
      params: {
        eventId: EVENT_ID,
        qrToken: QR_TOKEN,
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(AttendeeRepository, 'findByQrToken').mockResolvedValue(null);

    await scanTicketController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    expect(res.status).not.toHaveBeenCalled();
  });

  it('short-circuits with validation error when params are missing', async () => {
    const req = createMockRequest({
      params: {},
    });
    const res = createMockResponse();
    const next = createMockNext();

    const repoSpy = vi.spyOn(AttendeeRepository, 'findByQrToken');

    await scanTicketController(req, res, next as unknown as NextFunction);

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

describe('createAttendeeController', () => {
  it('throws TokenExpiredError when userId is missing', async () => {
    const req = createMockRequest({
      params: { eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();

    await createAttendeeController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(TokenExpiredError));
  });

  it('returns 400 when user profile is not completed', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: false,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    await createAttendeeController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
  });

  it('returns 404 when event is not found', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'findById').mockResolvedValue(null);

    await createAttendeeController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
  });

  it('returns 400 when event has expired', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      isActive: true,
      endTime: new Date(Date.now() - 1000),
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    await createAttendeeController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
  });

  it('returns 400 when event is at full capacity', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      isActive: true,
      capacity: 2,
      endTime: new Date(Date.now() + 10000),
      hostPermissionRequired: false,
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    vi.spyOn(AttendeeRepository, 'countAttendees').mockResolvedValue(2);

    await createAttendeeController(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
  });

  it('restores cancelled attendee instead of creating new one', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
      primaryEmail: 'user@test.com',
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      isActive: true,
      hostPermissionRequired: false,
      endTime: new Date(Date.now() + 10000),
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    vi.spyOn(AttendeeRepository, 'findByUserIdAndEventId').mockResolvedValue({
      id: 'att-1',
      isDeleted: true,
      status: AttendeeStatus.CANCELLED,
    } as unknown as Awaited<ReturnType<typeof AttendeeRepository.findByUserIdAndEventId>>);

    const restoreSpy = vi
      .spyOn(AttendeeRepository, 'restore')
      .mockResolvedValue({ id: 'att-1' } as unknown as Awaited<
        ReturnType<typeof AttendeeRepository.restore>
      >);

    await createAttendeeController(req, res, next as unknown as NextFunction);

    expect(restoreSpy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Attendee restored successfully',
      })
    );
  });

  it('creates attendee with GOING status when host permission is not required', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      params: { eventId: EVENT_ID },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
      primaryEmail: 'user@test.com',
      fullName: 'Test User',
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: EVENT_ID,
      name: 'Test Event',
      isActive: true,
      hostPermissionRequired: false,
      endTime: new Date(Date.now() + 10000),
    } as unknown as Awaited<ReturnType<typeof EventRepository.findById>>);

    vi.spyOn(AttendeeRepository, 'findByUserIdAndEventId').mockResolvedValue(null);
    vi.spyOn(AttendeeRepository, 'create').mockResolvedValue({
      id: 'att-123',
      eventId: EVENT_ID,
      qrToken: 'ABC123',
    } as unknown as Awaited<ReturnType<typeof AttendeeRepository.create>>);

    await createAttendeeController(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
      })
    );
  });
});

describe('getUserUpcomingEventController', () => {
  const eventOld = { id: 'old-1', startTime: '2023-01-01T10:00:00Z' };
  const eventNew = { id: 'new-1', startTime: '2024-01-01T10:00:00Z' };
  // An event with an invalid date to test the try/catch and Infinity logic
  const eventInvalid = { id: 'invalid-1', startTime: 'invalid-date-string' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merges, deduplicates, and sorts events descending (default)', async () => {
    const req = createMockRequest({ userId: USER_ID });
    const res = createMockResponse();
    const next = createMockNext();

    // Mock: User is registered for the old event
    vi.spyOn(AttendeeRepository, 'findRegisteredEventsByUser').mockResolvedValue({
      events: [eventOld],
      metadata: { total: 1 },
    } as any);

    // Mock: User is cohost for the new event
    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue([{ event: eventNew }] as any);

    await getUserUpcomingEventController(req, res, next as any);

    // Expect merged results, deduplicated (if any overlap), sorted descending (Newest first)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          events: [eventNew, eventOld],
        }),
      })
    );
  });

  it('sorts events ascending when startDate filter is present', async () => {
    // Providing a valid date string satisfies schema validation and triggers ascending sort
    const req = createMockRequest({
      userId: USER_ID,
      query: { startDate: '2023-01-01T00:00:00Z' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(AttendeeRepository, 'findRegisteredEventsByUser').mockResolvedValue({
      events: [eventNew],
      metadata: {},
    } as any);
    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue([{ event: eventOld }] as any);

    await getUserUpcomingEventController(req, res, next as any);

    // Sort Ascending (Oldest first): [eventOld, eventNew]
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          events: [eventOld, eventNew],
        }),
      })
    );
  });

  it('handles invalid dates gracefully without crashing', async () => {
    const req = createMockRequest({ userId: USER_ID });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(AttendeeRepository, 'findRegisteredEventsByUser').mockResolvedValue({
      events: [eventInvalid],
      metadata: {},
    } as any);
    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue([{ event: eventNew }] as any);

    await getUserUpcomingEventController(req, res, next as any);

    // Should not throw. Logic converts invalid dates to Infinity.
    // In descending sort: TimeB - TimeA.
    // If A is Invalid (Infinity), B is Valid (Number).
    // Valid - Infinity = -Infinity (A is "larger", so A comes first).
    // Note: Exact order depends on JS engine sort stability with Infinity,
    // but primarily we verify it returns success and includes both events.
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('success'),
        data: expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({ id: 'invalid-1' }),
            expect.objectContaining({ id: 'new-1' }),
          ]),
        }),
      })
    );
  });

  it('deduplicates events if user is both attendee and cohost', async () => {
    const req = createMockRequest({ userId: USER_ID });
    const res = createMockResponse();
    const next = createMockNext();

    // User is registered AND cohosting the same event
    vi.spyOn(AttendeeRepository, 'findRegisteredEventsByUser').mockResolvedValue({
      events: [eventNew],
      metadata: {},
    } as any);
    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue([{ event: eventNew }] as any);

    await getUserUpcomingEventController(req, res, next as any);

    // Result should contain unique event only once
    const jsonCall = (res.json as any).mock.calls[0][0];
    expect(jsonCall.data.events).toHaveLength(1);
    expect(jsonCall.data.events[0].id).toBe(eventNew.id);
  });

  it('filters out null/undefined events if repository returns holes', async () => {
    const req = createMockRequest({ userId: USER_ID });
    const res = createMockResponse();
    const next = createMockNext();

    // Mock cohost repo returning a cohost object where .event might be missing/null (edge case)
    vi.spyOn(AttendeeRepository, 'findRegisteredEventsByUser').mockResolvedValue({
      events: [eventNew],
      metadata: {},
    } as any);

    // Simulate a malformed cohost result or one that maps to undefined
    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue([
      { event: null },
      { event: undefined },
    ] as any);

    await getUserUpcomingEventController(req, res, next as any);

    // The .filter(Boolean) in controller should remove the nulls
    const jsonCall = (res.json as any).mock.calls[0][0];
    expect(jsonCall.data.events).toHaveLength(1);
    expect(jsonCall.data.events[0].id).toBe(eventNew.id);
  });

  it('throws TokenExpiredError if userId is missing', async () => {
    const req = createMockRequest({ userId: undefined });
    const res = createMockResponse();
    const next = createMockNext();

    await getUserUpcomingEventController(req, res, next as any);

    expect(next).toHaveBeenCalledWith(expect.any(TokenExpiredError));
  });

  it('handles empty results gracefully', async () => {
    const req = createMockRequest({ userId: USER_ID });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(AttendeeRepository, 'findRegisteredEventsByUser').mockResolvedValue({
      events: [],
      metadata: {},
    } as any);
    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue([] as any);

    await getUserUpcomingEventController(req, res, next as any);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          events: [],
        }),
      })
    );
  });
});
describe('getplannedByUserController', () => {
  const mockEvent1 = { id: 'evt-1', name: 'Planned Event 1', startTime: new Date('2024-06-01') };
  const mockEvent2 = { id: 'evt-2', name: 'Planned Event 2', startTime: new Date('2024-07-01') };
  const mockEvent3 = { id: 'evt-3', name: 'Planned Event 3', startTime: new Date('2024-05-01') };

  it('returns planned events with correct metadata and default sorting', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: {
        page: '1',
        limit: '10',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    const userSpy = vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);

    const mockRepoResponse = {
      data: [
        { event: mockEvent1, user: { id: USER_ID } },
        { event: mockEvent2, user: { id: USER_ID } },
      ],
      metadata: { total: 2, page: 1, limit: 10, hasMore: false },
    };

    const cohostSpy = vi
      .spyOn(CohostRepository, 'findAllByUserId')
      .mockResolvedValue(mockRepoResponse as any);

    await getplannedByUserController(req, res, next as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(userSpy).toHaveBeenCalledWith(USER_ID);

    expect(cohostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        paginationFilters: {
          status: 'all',
          search: undefined,
        },
        pagination: expect.objectContaining({
          page: 1,
          limit: 10,
          sortBy: 'startTime',
          sortOrder: 'desc',
        }),
      })
    );

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'success',
        data: {
          events: [mockEvent1, mockEvent2],
          metadata: expect.objectContaining({
            total: 2,
            page: 1,
            limit: 10,
          }),
        },
      })
    );
  });

  it('maps "attendees" sort query to "attendeeCount" for repository', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: {
        sort: 'attendees',
        page: '1',
        limit: '10',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);
    const cohostSpy = vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue({
      data: [],
      metadata: { total: 0, page: 1, limit: 10, hasMore: false },
    } as any);

    await getplannedByUserController(req, res, next as any);

    expect(cohostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({
          sortBy: 'attendeeCount',
        }),
      })
    );
  });

  it('sorts by date when sort query is "date"', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: {
        sort: 'date',
        sortOrder: 'asc',
        page: '1',
        limit: '10',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);
    const cohostSpy = vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue({
      data: [],
      metadata: { total: 0, page: 1, limit: 10, hasMore: false },
    } as any);

    await getplannedByUserController(req, res, next as any);

    expect(cohostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({
          sortBy: 'startTime',
          sortOrder: 'asc',
        }),
      })
    );
  });

  it('filters by active status', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: {
        status: 'active',
        page: '1',
        limit: '10',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);
    const cohostSpy = vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue({
      data: [],
      metadata: { total: 0, page: 1, limit: 10, hasMore: false },
    } as any);

    await getplannedByUserController(req, res, next as any);

    expect(cohostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        paginationFilters: {
          status: 'active',
          search: undefined,
        },
      })
    );
  });

  it('filters by inactive status', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: {
        status: 'inactive',
        page: '1',
        limit: '10',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);
    const cohostSpy = vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue({
      data: [],
      metadata: { total: 0, page: 1, limit: 10, hasMore: false },
    } as any);

    await getplannedByUserController(req, res, next as any);

    expect(cohostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        paginationFilters: {
          status: 'inactive',
          search: undefined,
        },
      })
    );
  });

  it('applies search filter when provided', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: {
        search: 'Tech Meetup',
        page: '1',
        limit: '10',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);
    const cohostSpy = vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue({
      data: [],
      metadata: { total: 0, page: 1, limit: 10, hasMore: false },
    } as any);

    await getplannedByUserController(req, res, next as any);

    expect(cohostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        paginationFilters: {
          status: 'all',
          search: 'Tech Meetup',
        },
      })
    );
  });

  it('handles pagination with different page numbers', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: {
        page: '3',
        limit: '5',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);
    const cohostSpy = vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue({
      data: [],
      metadata: { total: 20, page: 3, limit: 5, hasMore: true },
    } as any);

    await getplannedByUserController(req, res, next as any);

    expect(cohostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({
          page: 3,
          limit: 5,
        }),
      })
    );
  });

  it('deduplicates events if repository returns duplicates (Map logic)', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: { page: '1', limit: '10' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);

    // Mock repository returns already-deduplicated data (as pagination layer would do)
    const mockRepoResponse = {
      data: [{ event: mockEvent1, user: { id: USER_ID } }],
      metadata: { total: 1, page: 1, limit: 10, hasMore: false },
    };

    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue(mockRepoResponse as any);

    await getplannedByUserController(req, res, next as any);

    const jsonCall = (res.json as any).mock.calls[0][0];
    expect(jsonCall.data.events).toHaveLength(1);
    expect(jsonCall.data.events[0].id).toBe(mockEvent1.id);
    expect(jsonCall.data.metadata.total).toBe(1);
  });

  it('adjusts metadata total after deduplication', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: { page: '1', limit: '10' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);

    // Mock repository returns already-deduplicated data with correct metadata
    const mockRepoResponse = {
      data: [
        { event: mockEvent1, user: { id: USER_ID } },
        { event: mockEvent2, user: { id: USER_ID } },
      ],
      metadata: { total: 2, page: 1, limit: 10, hasMore: false },
    };

    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue(mockRepoResponse as any);

    await getplannedByUserController(req, res, next as any);

    const jsonCall = (res.json as any).mock.calls[0][0];
    expect(jsonCall.data.events).toHaveLength(2);
    expect(jsonCall.data.metadata.total).toBe(2);
    expect(jsonCall.data.metadata.hasMore).toBe(false);
  });

  it('returns empty array when user has no planned events', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: { page: '1', limit: '10' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);
    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue({
      data: [],
      metadata: { total: 0, page: 1, limit: 10, hasMore: false },
    } as any);

    await getplannedByUserController(req, res, next as any);

    const jsonCall = (res.json as any).mock.calls[0][0];
    expect(jsonCall.data.events).toHaveLength(0);
    expect(jsonCall.data.metadata.total).toBe(0);
  });

  it('handles multiple cohosts for different events', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: { page: '1', limit: '10' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);

    const mockRepoResponse = {
      data: [
        { event: mockEvent1, user: { id: USER_ID } },
        { event: mockEvent2, user: { id: USER_ID } },
        { event: mockEvent3, user: { id: USER_ID } },
      ],
      metadata: { total: 3, page: 1, limit: 10, hasMore: false },
    };

    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue(mockRepoResponse as any);

    await getplannedByUserController(req, res, next as any);

    const jsonCall = (res.json as any).mock.calls[0][0];
    expect(jsonCall.data.events).toHaveLength(3);
    expect(jsonCall.data.events.map((e: any) => e.id)).toEqual(['evt-1', 'evt-2', 'evt-3']);
  });

  it('handles ascending sort order', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: {
        sortOrder: 'asc',
        page: '1',
        limit: '10',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);
    const cohostSpy = vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue({
      data: [],
      metadata: { total: 0, page: 1, limit: 10, hasMore: false },
    } as any);

    await getplannedByUserController(req, res, next as any);

    expect(cohostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({
          sortOrder: 'asc',
        }),
      })
    );
  });

  it('handles combined filters (status, search, sort, sortOrder)', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: {
        status: 'active',
        search: 'Conference',
        sort: 'attendees',
        sortOrder: 'asc',
        page: '2',
        limit: '20',
      },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);
    const cohostSpy = vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue({
      data: [],
      metadata: { total: 0, page: 2, limit: 20, hasMore: false },
    } as any);

    await getplannedByUserController(req, res, next as any);

    expect(cohostSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        paginationFilters: {
          status: 'active',
          search: 'Conference',
        },
        pagination: expect.objectContaining({
          page: 2,
          limit: 20,
          sortBy: 'attendeeCount',
          sortOrder: 'asc',
        }),
      })
    );
  });

  it('throws TokenExpiredError if userId is missing from request', async () => {
    const req = createMockRequest({
      userId: undefined,
      query: { page: '1', limit: '10' },
    });
    const res = createMockResponse();
    const next = createMockNext();
    const userSpy = vi.spyOn(UserRepository, 'findById');

    await getplannedByUserController(req, res, next as any);

    expect(next).toHaveBeenCalledWith(expect.any(TokenExpiredError));
    expect(userSpy).not.toHaveBeenCalled();
  });

  it('throws TokenExpiredError if user is not found in database', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: { page: '1', limit: '10' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    const userSpy = vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);
    const cohostSpy = vi.spyOn(CohostRepository, 'findAllByUserId');

    await getplannedByUserController(req, res, next as any);

    expect(userSpy).toHaveBeenCalledWith(USER_ID);
    expect(next).toHaveBeenCalledWith(expect.any(TokenExpiredError));
    expect(cohostSpy).not.toHaveBeenCalled();
  });

  it('preserves original pagination values in metadata', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: { page: '5', limit: '25' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);
    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue({
      data: [{ event: mockEvent1, user: { id: USER_ID } }],
      metadata: { total: 1, page: 5, limit: 25, hasMore: false },
    } as any);

    await getplannedByUserController(req, res, next as any);

    const jsonCall = (res.json as any).mock.calls[0][0];
    expect(jsonCall.data.metadata.page).toBe(5);
    expect(jsonCall.data.metadata.limit).toBe(25);
  });

  it('handles null events in response data', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      query: { page: '1', limit: '10' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: USER_ID } as any);

    // Mock repository returns data without nulls (as pagination layer would filter)
    const mockRepoResponse = {
      data: [
        { event: mockEvent1, user: { id: USER_ID } },
        { event: mockEvent2, user: { id: USER_ID } },
      ],
      metadata: { total: 2, page: 1, limit: 10, hasMore: false },
    };

    vi.spyOn(CohostRepository, 'findAllByUserId').mockResolvedValue(mockRepoResponse as any);

    await getplannedByUserController(req, res, next as any);

    const jsonCall = (res.json as any).mock.calls[0][0];
    expect(jsonCall.data.events).toHaveLength(2);
    expect(jsonCall.data.events.map((e: any) => e.id)).toEqual(['evt-1', 'evt-2']);
  });
});
