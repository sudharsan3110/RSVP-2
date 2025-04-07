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

import { Role } from '@prisma/client';
import { eventManageMiddleware } from '@/middleware/hostMiddleware';

const API_ROLES = {
  CHECK_ALLOW_STATUS: [Role.Creator, Role.Manager],
  DELETE_EVENT: [Role.Creator],
  UPDATE_EVENT: [Role.Creator, Role.Manager],
};

let isAuthenticated: boolean = true;

vi.mock('@/middleware/authMiddleware', () => {
  return {
    default: (req: Request, res: Response, next: NextFunction) => {
      if (isAuthenticated) {
        (req as any).userId = TEST_USER_ID;
        next();
      } else {
        return res.status(401).json({ message: 'Invalid or expired tokens' });
      }
    },
  };
});

let currentTestRole: Role | null = null;
vi.mock('@/middleware/hostMiddleware', () => {
  return {
    eventManageMiddleware: (allowedRoles: Role[]) => {
      return (req: Request, res: Response, next: NextFunction) => {
        const userRole = currentTestRole;

        if (!userRole) {
          return res.status(403).json({
            message: 'Access denied: No role specified',
          });
        }
        if (allowedRoles.includes(userRole)) {
          next();
        } else {
          return res.status(403).json({
            message: 'Access denied: Insufficient permissions',
          });
        }
      };
    },
  };
});

const app = express();
app.use(express.json());
app.use(eventRouter);

beforeEach(() => {
  vi.resetAllMocks();
  currentTestRole = null;
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
      isAuthenticated = true;
      const fakeUser = { id: TEST_USER_ID, is_completed: true, primary_email: 'user@example.com' };
      vi.spyOn(Users as any, 'findById').mockResolvedValue(fakeUser);
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
      isAuthenticated = true;
      const fakeUser = { id: TEST_USER_ID, is_completed: true };
      vi.spyOn(Users as any, 'findById').mockResolvedValue(fakeUser);
      const res = await request(app).post('/').send(invalidPhysicalEventPayload);
      expect(res.status).toBe(HTTP_BAD_REQUEST);
      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 if user profile is incomplete', async () => {
      isAuthenticated = true;
      const incompleteUser = { id: TEST_USER_ID, is_completed: false };
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
      isAuthenticated = true;
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

  describe(`DELETE /eventId/attendee (softDeleteAttendee)`, () => {
    it('should soft-delete the attendee record', async () => {
      isAuthenticated = true;
      const fakeAttendee = { id: 'attendee-1', userId: TEST_USER_ID, deleted: false };
      vi.spyOn(Attendees as any, 'findByUserIdAndEventId').mockResolvedValue(fakeAttendee);
      vi.spyOn(Attendees as any, 'softDelete').mockResolvedValue(undefined);
      const res = await request(app).delete(`/event-123/attendee`);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'Attendee removed successfully');
    });
  });

  describe(`GET /:eventId (getEventById)`, () => {
    it('should return event details when a valid eventId is provided', async () => {
      isAuthenticated = true;
      const fakeEventDetail = { id: 'event-123', name: 'Event Detail' };
      vi.spyOn(Events as any, 'findById').mockResolvedValue(fakeEventDetail);
      vi.spyOn(Attendees as any, 'countAttendees').mockResolvedValue(5);
      const res = await request(app).get(`/event-123`);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('event', fakeEventDetail);
      expect(res.body).toHaveProperty('totalAttendees', 5);
    });
  });

  describe('GET /:eventId/attendee/:userId/allowStatus (checkAllowStatus)', () => {
    const eventId = 'event-123';
    const userId = TEST_USER_ID;
    const endpoint = `/${eventId}/attendee/${userId}/allowStatus`;

    it('should allow authenticated Creator role to check allow status', async () => {
      isAuthenticated = true;
      currentTestRole = Role.Manager;
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'Success');
      expect(res.body.data).toHaveProperty('success', true);
    });

    it('should deny unauthenticated requests from checking allow status', async () => {
      isAuthenticated = false;
      currentTestRole = Role.Creator; 
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid or expired tokens');
    });

    it('should allow authenticated Manager role to check allow status', async () => {
      isAuthenticated = true;
      currentTestRole = Role.Manager;
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'Success');
      expect(res.body.data).toHaveProperty('success', true);
    });

    it('should deny authenticated ReadOnly role from checking allow status', async () => {
      isAuthenticated = true;
      currentTestRole = Role.ReadOnly;
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Access denied: Insufficient permissions');
    });

    it('should deny authenticated requests with no role from checking allow status', async () => {
      isAuthenticated = true;
      currentTestRole = null;
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Access denied: No role specified');
    });
  });

  describe('DELETE /:eventId (deleteEvent)', () => {
    const eventId = 'event-123';
    const endpoint = `/${eventId}`;

    it('should allow authenticated Creator role to delete an event', async () => {
      isAuthenticated = true;
      currentTestRole = Role.Creator;
      const fakeEvent = { id: eventId, name: 'Event to Delete', isDeleted: false };
      vi.spyOn(Events as any, 'findById').mockResolvedValue(fakeEvent);
      const deletedEvent = { ...fakeEvent, isDeleted: true };
      vi.spyOn(Events as any, 'delete').mockResolvedValue(deletedEvent);
      const res = await request(app).delete(endpoint);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'Event deleted successfully');
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data', deletedEvent);
    });

    it('should deny unauthenticated requests from deleting an event', async () => {
      isAuthenticated = false;
      currentTestRole = Role.Creator;
      const res = await request(app).delete(endpoint);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid or expired tokens');
    });

    it('should deny authenticated Manager role from deleting an event', async () => {
      isAuthenticated = true;
      currentTestRole = Role.Manager;
      const res = await request(app).delete(endpoint);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Access denied: Insufficient permissions');
    });

    it('should deny authenticated ReadOnly role from deleting an event', async () => {
      isAuthenticated = true;
      currentTestRole = Role.ReadOnly;
      const res = await request(app).delete(endpoint);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Access denied: Insufficient permissions');
    });

    it('should return 404 if the event does not exist', async () => {
      isAuthenticated = true;
      currentTestRole = Role.Creator;
      vi.spyOn(Events as any, 'findById').mockResolvedValue(null);
      const res = await request(app).delete(endpoint);
      expect(res.status).toBe(HTTP_NOT_FOUND);
      expect(res.body).toHaveProperty('message', 'Event not found');
    });

    it('should return 400 if the event is already deleted', async () => {
      isAuthenticated = true;
      currentTestRole = Role.Creator;
      const alreadyDeletedEvent = { id: eventId, name: 'Already Deleted Event', isDeleted: true };
      vi.spyOn(Events as any, 'findById').mockResolvedValue(alreadyDeletedEvent);
      const res = await request(app).delete(endpoint);
      expect(res.status).toBe(HTTP_BAD_REQUEST);
      expect(res.body).toHaveProperty('message', 'Event already deleted');
    });

    it('should return 404 when trying to delete with no event ID', async () => {
      isAuthenticated = true;
      currentTestRole = Role.Creator;
      const res = await request(app).delete('/');
      expect(res.status).toBe(404);
    });
  });
});
