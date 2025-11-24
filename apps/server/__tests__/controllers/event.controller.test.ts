import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Response, NextFunction } from 'express';
import type { IAuthenticatedRequest } from '@/interface/middleware';
import { AttendeeStatus, VenueType } from '@prisma/client';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/utils/apiError';

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
} from '@/controllers/event.controller';
import { EventRepository } from '@/repositories/event.repository';
import { AttendeeRepository } from '@/repositories/attendee.repository';
import { CohostRepository } from '@/repositories/cohost.repository';
import { UserRepository } from '@/repositories/user.repository';
import EmailService from '@/utils/sendEmail';

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

const createMockNext = () => vi.fn<NextFunction>();

const EVENT_ID = '11111111-1111-1111-1111-111111111111';
const ATTENDEE_ID = '22222222-2222-2222-2222-222222222222';
const USER_ID = '33333333-3333-3333-3333-333333333333';

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

    await getEventBySlugController(req, res, next);

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

    await getEventBySlugController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0]![0] as NotFoundError;
    expect(error.message).toBe('Event not found');
    expect(res.status).not.toHaveBeenCalled();
  });

  it('short-circuits with validation error when slug param is absent', async () => {
    const req = createMockRequest({ params: {} as any });
    const res = createMockResponse();
    const next = createMockNext();

    const repoSpy = vi.spyOn(EventRepository, 'findbySlug');

    await getEventBySlugController(req, res, next);

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

  it('creates event, auto-creates category, and assigns creator cohost', async () => {
    const req = createMockRequest({
      userId: USER_ID,
      body: baseBody(),
    });
    const res = createMockResponse();
    const next = createMockNext();
    const createdCategory = { id: 'cat-1', name: 'Technology' };
    const createdEvent = { id: EVENT_ID, name: 'Tech Meetup', slug: 'tech-meetup' };

    mocks.categoryFindFirstMock.mockResolvedValueOnce(null);
    mocks.categoryCreateMock.mockResolvedValueOnce(createdCategory);
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({
      id: USER_ID,
      isCompleted: true,
    } as unknown as Awaited<ReturnType<typeof UserRepository.findById>>);
    const createEventSpy = vi
      .spyOn(EventRepository, 'create')
      .mockResolvedValue(
        createdEvent as unknown as Awaited<ReturnType<typeof EventRepository.create>>
      );
    const createHostSpy = vi
      .spyOn(CohostRepository, 'create')
      .mockResolvedValue({} as unknown as Awaited<ReturnType<typeof CohostRepository.create>>);

    await createEventController(req, res, next);

    expect(UserRepository.findById).toHaveBeenCalledWith(USER_ID);
    expect(mocks.categoryFindFirstMock).toHaveBeenCalledWith({ where: { name: 'Technology' } });
    expect(mocks.categoryCreateMock).toHaveBeenCalledWith({ data: { name: 'Technology' } });
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

    await createEventController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0]![0] as BadRequestError;
    expect(error.message).toBe('Description cannot be greater than 300 characters.');
    expect(createEventSpy).not.toHaveBeenCalled();
    expect(createHostSpy).not.toHaveBeenCalled();
  });
});

describe('updateEventController', () => {
  it('updates event, unlocks waiting attendees, and skips email in development', async () => {
    const req = createMockRequest({
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
    const existingEvent = {
      id: EVENT_ID,
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

    await updateEventController(req, res, next);

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
      params: { eventId: EVENT_ID },
      body: {
        hostPermissionRequired: false,
      },
    });
    const res = createMockResponse();
    const next = createMockNext();
    const updateSpy = vi.spyOn(EventRepository, 'update');

    await updateEventController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0]![0] as BadRequestError;
    expect(error.message).toBe('Venue type cannot be updated');
    expect(updateSpy).not.toHaveBeenCalled();
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

    await verifyQrController(req, res, next);

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

    await verifyQrController(req, res, next);

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

    await verifyQrController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    const error = next.mock.calls[0]![0] as BadRequestError;
    expect(error.message).toBe('Ticket verification will start 1 hour before the event');
    expect(attendeeUpdateSpy).not.toHaveBeenCalled();
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

    await deleteAttendeeController(req, res, next);

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

    await deleteAttendeeController(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    const error = next.mock.calls[0]![0] as NotFoundError;
    expect(error.message).toBe('The event has already ended, cannot cancel registration.');
    expect(attendeeFindSpy).not.toHaveBeenCalled();
  });
});
