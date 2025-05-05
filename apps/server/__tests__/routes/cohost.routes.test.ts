import { cohostRouter } from '@/routes/v1/cohost.routes';
import express, { Request, Response, NextFunction } from 'express';
import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { FAKE_EVENT, FAKE_USER_ID2, TEST_USER_ID } from '@/utils/testConstants';
import { CohostRepository } from '../../src/repositories/cohost.repository';
import { EventRepository } from '@/repositories/event.repository';
import { Role } from '@prisma/client';
import { API_MESSAGES } from '@/constants/apiMessages';



const app = express();

app.use(express.json());
app.use('/v1/cohosts', cohostRouter);

let isAuthenticated = true;

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

describe('DELETE /v1/cohosts/events/:eventId/:cohostUserId', () => {
  const cohostUserId = FAKE_USER_ID2.id;
  const creatorId = TEST_USER_ID;
  const eventId = FAKE_EVENT.id;
  const endpoint = `/v1/cohosts/events/${eventId}/${cohostUserId}`;

  beforeEach(() => {
    vi.clearAllMocks();
    currentTestRole = Role.CREATOR;
  });

  it('should successfully remove a cohost', async () => {
    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: eventId,
      creatorId: creatorId,
      cohostUserId,
    } as any);
  
  vi.spyOn(CohostRepository, 'FindhostOrCohost').mockImplementation(async (userId, eventId, roles = []) => {
      if (userId === cohostUserId && roles.length === 0) {
        return true;
      }
      if (userId === TEST_USER_ID && roles.includes(Role.CREATOR)) {
        return true; 
      }
      if (userId === cohostUserId && roles.includes(Role.MANAGER)) {
        return false; 
      }
      return false;
    });

    
    vi.spyOn(CohostRepository, 'removeCoHost').mockResolvedValue(true);
    const response = await request(app).delete(endpoint);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Cohost removed successfully',
    });
  });
  it('should return 403 if manager tries to remove creator', async () => {
    const cohostUserId = FAKE_USER_ID2.id; // This is the creator being removed
    const managerId = TEST_USER_ID; // This is the manager trying to remove
    const endpoint = `/v1/cohosts/events/${eventId}/${cohostUserId}`;
    currentTestRole = Role.MANAGER; // Set the role to MANAGER
  
    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: eventId,
      creatorId: cohostUserId, // The cohost is the creator
      cohostUserId,
    } as any);

    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockImplementation(async (userId, eventId, roles = [], returnType = false) => {
      if (returnType) {
        if (userId === cohostUserId && roles.includes(Role.CREATOR)) {
          return Role.CREATOR;
        }
        if (userId === managerId && roles.includes(Role.MANAGER)) {
          return Role.MANAGER;
        }
      }
      return false;
    });

    const response = await request(app).delete(endpoint);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: API_MESSAGES.COHOST.REMOVE.CANNOT_REMOVE_CREATOR
    });
  });

  it('should return 403 if cohost is not creator or Manger', async () => {
  
    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: eventId,
      creator: creatorId,
      cohostUserId,
    } as any);

   currentTestRole = Role.READ_ONLY;
    vi.spyOn(CohostRepository, 'removeCoHost').mockResolvedValue(
      {
        id: cohostUserId,
        userId: cohostUserId,
        eventId: eventId,

      } as any
    )

    const response = await request(app).delete(endpoint);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: 'Access denied: Insufficient permissions',

    });
  });
  it('should return 404 if cohostId is missing ', async()=>{
    const endpoint = `/v1/cohosts/events/${eventId}`;
    const response = await request(app).delete(endpoint);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({});
})
  it('should return 404 if eventId is missing ', async()=>{
    const eventId = null;
    const endpoint = `/v1/cohosts/events/${eventId}`;
    const response = await request(app).delete(endpoint);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({});
    
    
  })
  it('should return 400 if user tries to remove self', async()=>{
    const creatorId = TEST_USER_ID;
    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: eventId,
      creatorId: creatorId,
      cohostUserId :creatorId
    } as any);
    const endpoint = `/v1/cohosts/events/${eventId}/${TEST_USER_ID}`;
    const response = await request(app).delete(endpoint);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: API_MESSAGES.COHOST.REMOVE.CANNOT_REMOVE_SELF
    });
  })
  it('should return 400 if user being removed is not a cohost', async () => {
    const nonCohostUserId = FAKE_USER_ID2.id; 
    const creatorId = TEST_USER_ID;
    const endpoint = `/v1/cohosts/events/${eventId}/${nonCohostUserId}`;
    currentTestRole = Role.CREATOR;

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({
      id: eventId,
      creatorId: creatorId,
      cohostUserId: nonCohostUserId,
    } as any);

    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockImplementation(async (userId, eventId, roles = [], returnType = false) => {
      if (returnType) {
        if (userId === creatorId && roles.includes(Role.CREATOR)) {
          return Role.CREATOR;
        }
        if (userId === nonCohostUserId && roles.length === 0) {
          return false;
        }
      }
      return false;
    });

    vi.spyOn(CohostRepository, 'removeCoHost').mockResolvedValue(false);

    const response = await request(app).delete(endpoint);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: API_MESSAGES.COHOST.REMOVE.FAILED
    });
  });
  it('should return 400 if removeCoHost fails and returns null', async () => {
    const cohostUserId = 'cohost123';
    const creatorId = 'creator123';
    const eventId = 'event123';
    const endpoint = `/v1/cohosts/events/${eventId}/${cohostUserId}`;
    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockImplementation(async (userId, eventId, roles = []) => {
      if (userId === cohostUserId && roles.length === 0) {
        return true;
      }
      if (userId === creatorId && roles.includes(Role.CREATOR)) {
        return false;
      }
      if (userId === cohostUserId && roles.includes(Role.MANAGER)) {
        return true;
      }
      if (userId === creatorId && roles.includes(Role.MANAGER)) {
        return true; 
      }
      return false;
    });
    vi.spyOn(CohostRepository, 'removeCoHost').mockResolvedValue(null as any)
    const response = await request(app).delete(endpoint)
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: API_MESSAGES.COHOST.REMOVE.FAILED,
    });
  });
 
});