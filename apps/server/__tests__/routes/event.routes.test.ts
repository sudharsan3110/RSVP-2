import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { eventRouter } from '@/routes/v1/event.routes';
import { Events } from '@/db/models/events';
import { Attendees } from '@/db/models/attendees';
import { Users } from '@/db/models/users';
import { CohostRepository } from '@/db/models/cohost';
import {
  ENDPOINT_FILTER_EVENTS,
  ENDPOINT_POPULAR_EVENTS,
  ENDPOINT_SLUG,
  ENDPOINT_USER_EVENTS,
  FAKE_ATTENDEE_COUNT,
  FAKE_EVENT,
  FAKE_USER,
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
  HTTP_NOT_FOUND,
  HTTP_OK,
  TEST_USER_ID,
} from '@/utils/testConstants';

vi.mock('@/middleware/authMiddleware', () => {
  return {
    default: (req: Request, _res: Response, next: NextFunction) => {
      (req as any).userId = TEST_USER_ID;
      next();
    },
  };
});

const app = express();
app.use(express.json());
app.use(eventRouter);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Event Router Endpoints', () => {
  describe('GET /slug/:slug', () => {
    it('should return event details and attendee count when a valid slug is provided', async () => {
      vi.spyOn(Events as any, 'findUnique').mockResolvedValue(FAKE_EVENT);
      vi.spyOn(Attendees as any, 'countAttendees').mockResolvedValue(FAKE_ATTENDEE_COUNT);
      const res = await request(app).get(`${ENDPOINT_SLUG}/${FAKE_EVENT.slug}`);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('event', FAKE_EVENT);
      expect(res.body).toHaveProperty('totalAttendees', FAKE_ATTENDEE_COUNT);
    });

    it('should return 404 if no event is found', async () => {
      vi.spyOn(Events as any, 'findUnique').mockResolvedValue(null);
      const res = await request(app).get(`${ENDPOINT_SLUG}/nonexistent-slug`);
      expect(res.status).toBe(HTTP_NOT_FOUND);
      expect(res.body).toHaveProperty('message', 'Event not found');
    });
  });

  describe(`GET / (allPlannedEvents)`, () => {
    it('should return all planned events', async () => {
      const fakeEvents = [
        { id: 'event-1', name: 'Event One' },
        { id: 'event-2', name: 'Event Two' },
      ];
      vi.spyOn(Events as any, 'findAllEvents').mockResolvedValue(fakeEvents);
      const res = await request(app).get('/');
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'All Events Data');
      expect(res.body).toHaveProperty('data', fakeEvents);
    });
  });

  describe(`POST / (createEvent)`, () => {
    const validPhysicalEventPayload = {
      name: 'Annual Conference',
      category: 'Conference',
      description: 'An event to discuss annual trends',
      eventImageId: 'img-123',
      venueType: 'physical',
      venueAddress: 'World Trade Center, Bengaluru',
      hostPermissionRequired: true,
      capacity: 50,
      startTime: new Date(Date.now() + 3600 * 1000).toISOString(),
      endTime: new Date(Date.now() + 7200 * 1000).toISOString(),
      eventDate: new Date(Date.now() + 86400 * 1000).toISOString(),
    };
    const invalidPhysicalEventPayload = {
      ...validPhysicalEventPayload,
      venueUrl: 'https://example.com/venue',
      venueAddress: 'World Trade Center, Bengaluru',
    };

    it('should create a new event with valid data', async () => {
      vi.spyOn(Users as any, 'findById').mockResolvedValue(FAKE_USER);
      const fakeNewEvent = {
        id: 'event-456',
        name: validPhysicalEventPayload.name,
        slug: 'annual-conference',
      };
      vi.spyOn(Events as any, 'create').mockResolvedValue(fakeNewEvent);
      vi.spyOn(CohostRepository as any, 'addHost').mockResolvedValue(undefined);
      const res = await request(app).post('/').send(validPhysicalEventPayload);
      expect(res.status).toBe(HTTP_CREATED);
      expect(res.body).toHaveProperty('message', 'success');
      expect(res.body.event).toMatchObject({
        id: fakeNewEvent.id,
        name: validPhysicalEventPayload.name,
        slug: expect.any(String),
      });
    });

    it('should return 400 when payload validation fails (invalid venue fields)', async () => {
      vi.spyOn(Users as any, 'findById').mockResolvedValue(FAKE_USER);
      const res = await request(app).post('/').send(invalidPhysicalEventPayload);
      expect(res.status).toBe(HTTP_BAD_REQUEST);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 if user profile is incomplete', async () => {
      const incompleteUser = { ...FAKE_USER, is_completed: false };
      vi.spyOn(Users as any, 'findById').mockResolvedValue(incompleteUser);
      const res = await request(app).post('/').send(validPhysicalEventPayload);
      expect(res.status).toBe(HTTP_BAD_REQUEST);
      expect(res.body).toHaveProperty(
        'message',
        'Please complete your profile before creating event'
      );
    });
  });

  describe(`GET ${ENDPOINT_POPULAR_EVENTS}`, () => {
    it('should return popular events with a specified limit', async () => {
      const fakePopularEvents = [{ id: 'event-1', name: 'Popular Event' }];
      vi.spyOn(Events as any, 'getPopularEvents').mockResolvedValue(fakePopularEvents);
      const res = await request(app).get(ENDPOINT_POPULAR_EVENTS).query({ limit: 5 });
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('data', fakePopularEvents);
    });
  });

  describe(`GET ${ENDPOINT_FILTER_EVENTS}`, () => {
    it('should return filtered events with metadata', async () => {
      const fakeEvents = [{ id: 'event-1', name: 'Filtered Event' }];
      vi.spyOn(Events as any, 'findEvents').mockResolvedValue(fakeEvents);
      vi.spyOn(Events as any, 'findAllEvents').mockResolvedValue(fakeEvents);
      const res = await request(app).get(ENDPOINT_FILTER_EVENTS).query({ page: 1, limit: 10 });
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'Filtered Events Data');
      expect(res.body).toHaveProperty('data', fakeEvents);
      expect(res.body).toHaveProperty('metadata');
    });
  });

  describe(`GET ${ENDPOINT_USER_EVENTS} (plannedByUser)`, () => {
    it('should return planned events for the authenticated user', async () => {
      const fakeUser = { id: TEST_USER_ID };
      vi.spyOn(Users as any, 'findById').mockResolvedValue(fakeUser);
      const fakePlannedEvents = [{ id: 'event-1', name: 'User Event' }];
      vi.spyOn(Events as any, 'plannedEvents').mockResolvedValue(fakePlannedEvents);
      const res = await request(app).get(ENDPOINT_USER_EVENTS).query({ page: 1, limit: 10 });
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'success');
      expect(res.body).toHaveProperty('data', fakePlannedEvents);
    });
  });

  describe(`GET /:eventId (getEventById)`, () => {
    it('should return event details when a valid eventId is provided', async () => {
      const fakeEventDetail = { id: 'event-123', name: 'Event Detail' };
      vi.spyOn(Events as any, 'findById').mockResolvedValue(fakeEventDetail);
      vi.spyOn(Attendees as any, 'countAttendees').mockResolvedValue(5);
      const res = await request(app).get(`/event-123`);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('event', fakeEventDetail);
      expect(res.body).toHaveProperty('totalAttendees', 5);
    });
  });

  describe(`PATCH /eventId/attendee/:userId/allowStatus (checkAllowStatus)`, () => {
    it('should check the allow status for the attendee', async () => {
      vi.spyOn(CohostRepository as any, 'checkHostForEvent').mockResolvedValue(true);
      const res = await request(app).patch(`/event-123/attendee/${TEST_USER_ID}/allowStatus`);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('message', 'Success');
    });
  });

  describe(`DELETE /eventId/attendee (softDeleteAttendee)`, () => {
    it('should soft-delete the attendee record', async () => {
      const fakeAttendee = { id: 'attendee-1', userId: TEST_USER_ID, deleted: false };
      vi.spyOn(Attendees as any, 'findByUserIdAndEventId').mockResolvedValue(fakeAttendee);
      vi.spyOn(Attendees as any, 'softDelete').mockResolvedValue(undefined);
      const res = await request(app).delete(`/event-123/attendee`);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'Attendee removed successfully');
    });
  });
});
