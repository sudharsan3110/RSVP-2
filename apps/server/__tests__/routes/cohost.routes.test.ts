import { cohostRouter } from '@/routes/v1/cohost.routes';
import express, { Request, Response, NextFunction } from 'express';
import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { FAKE_EVENT, FAKE_HOST, FAKE_USER_ID2, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_OK, TEST_USER_ID } from '@/utils/testConstants';
import { CohostRepository } from '../../src/repositories/cohost.repository';
import { EventRepository } from '@/repositories/event.repository';
import { Role } from '@prisma/client';
import { API_MESSAGES } from '@/constants/apiMessages';
import { UserRepository } from '@/repositories/user.repository';
import { ApiError, InternalError, NotFoundError } from '@/utils/apiError';
import logger from '@/utils/logger';



const app = express();

app.use(express.json());
app.use(cohostRouter);
app.use((err: Error, _req: any, res: any, _next: NextFunction) => {
  if (err instanceof ApiError) {
    // req.error = err.message;
    ApiError.handle(err, res);
  } else {
    logger.error(err);
    const errorMessage = 'We are experiencing high traffic, please try again later';
    ApiError.handle(new InternalError(errorMessage), res);
  }
});
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
  const endpoint = `/events/${eventId}/${cohostUserId}`;

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
    expect(response.body).toHaveProperty(
      'message', 'Cohost removed successfully'
    );
  });
  it('should return 403 if manager tries to remove creator', async () => {
    const cohostUserId = FAKE_USER_ID2.id; // This is the creator being removed
    const managerId = TEST_USER_ID; // This is the manager trying to remove
    const endpoint = `/events/${eventId}/${cohostUserId}`;
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
    expect(response.body).toHaveProperty(
      'message', API_MESSAGES.COHOST.REMOVE.CANNOT_REMOVE_CREATOR
    );
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
    const endpoint = `/events/${eventId}`;
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
    const endpoint = `/events/${eventId}/${TEST_USER_ID}`;
    const response = await request(app).delete(endpoint);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      'message', API_MESSAGES.COHOST.REMOVE.CANNOT_REMOVE_SELF
    );
  })
  it('should return 400 if user being removed is not a cohost', async () => {
    const nonCohostUserId = FAKE_USER_ID2.id;
    const creatorId = TEST_USER_ID;
    const endpoint = `/events/${eventId}/${nonCohostUserId}`;
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
    expect(response.body).toHaveProperty(
      'message', API_MESSAGES.COHOST.REMOVE.FAILED
    );
  });
  it('should return 400 if removeCoHost fails and returns null', async () => {
    const cohostUserId = 'cohost123';
    const creatorId = 'creator123';
    const eventId = 'event123';
    const endpoint = `/events/${eventId}/${cohostUserId}`;
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
    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty(
      'message', API_MESSAGES.COHOST.REMOVE.FAILED,
    );
  });
});


describe('POST /v1/cohost/', () => {
  const cohostUserId = FAKE_USER_ID2.id;
  const creatorId = TEST_USER_ID;
  const eventId = FAKE_EVENT.id;
  const cohostEmail = FAKE_USER_ID2.email
  const endpoint = `/`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Creator Should successfully add a cohost when provided with valid data.', async () => {
    currentTestRole = Role.CREATOR;

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({ ...FAKE_EVENT, Cohost: [] } as any);

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


    vi.spyOn(UserRepository, 'findbyEmail').mockResolvedValue({ ...FAKE_USER_ID2, isCompleted: true } as any);

    vi.spyOn(CohostRepository, 'findByUserIdAndEventId').mockResolvedValue(null);


    vi.spyOn(CohostRepository as any, 'create').mockResolvedValue({
      userId: cohostUserId,
      eventId: eventId,
      role: currentTestRole,
      isDeleted: false
    });

    const response = await request(app).post(endpoint).send({
      eventId,
      email: cohostEmail,
      role: "Manager",
    });


    expect(response.status).toBe(HTTP_OK);
    expect(response.body).toHaveProperty('message', 'success');

  });

  it('Manager Should successfully add a cohost when provided with valid data.', async () => {
    currentTestRole = Role.MANAGER;

    vi.spyOn(EventRepository, 'findById').mockResolvedValue({ ...FAKE_EVENT, Cohost: [] } as any);

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


    vi.spyOn(UserRepository, 'findbyEmail').mockResolvedValue({ ...FAKE_USER_ID2, isCompleted: true } as any);

    vi.spyOn(CohostRepository, 'findByUserIdAndEventId').mockResolvedValue(null);

    vi.spyOn(CohostRepository as any, 'create').mockResolvedValue({
      userId: cohostUserId,
      eventId: eventId,
      role: currentTestRole,
      isDeleted: false
    });

    const response = await request(app).post(endpoint).send({
      eventId,
      email: cohostEmail,
      role: "Manager",
    });

    expect(response.status).toBe(HTTP_OK);
    expect(response.body).toHaveProperty('message', 'success');

  });

  it('Should return 400 Bad Request if the request body is missing required fields or contains an invalid email format.', async () => {
    currentTestRole = Role.CREATOR;
    const response = await request(app).post(endpoint).send({});

    expect(response.status).toBe(HTTP_BAD_REQUEST);
    expect(response.body).toHaveProperty('message', 'Invalid Request');
  })


  it('Should return 403 Forbidden if the user lacks the necessary permissions.', async () => {
    currentTestRole = Role.MANAGER;

    vi.spyOn(CohostRepository, 'FindhostOrCohost').mockResolvedValue(false);

    const response = await request(app).post(endpoint).send({
      eventId,
      email: cohostEmail,
      role: "Manager",
    });
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'Insufficient permissions: You need to be a Creator or Manager to add hosts to an event');
  })


  it('Should return 403 Forbidden if user has readonly permission', async () => {
    currentTestRole = Role.READ_ONLY;


    const response = await request(app).post(endpoint).send({
      eventId,
      email: cohostEmail,
      role: "Manager",
    });
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'Access denied: Insufficient permissions');
  })


  it('Should return Conflict if the user being added is already a cohost.', async () => {
    currentTestRole = Role.CREATOR;


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

    // Mock that the host already exists
    vi.spyOn(CohostRepository, 'findByUserIdAndEventId').mockResolvedValue(FAKE_HOST);

    // Make sure you're using the correct endpoint - not the root path
    const response = await request(app).post(endpoint).send({
      eventId,
      email: cohostEmail,
      role: "Manager",
    });


    expect(response.status).toBe(HTTP_BAD_REQUEST); // 400 status code
    expect(response.body).toHaveProperty('message', 'Host already exists');
  });




  it('Should return 404 Not Found if the specified event does not exist.', async () => {
    currentTestRole = Role.CREATOR;

    vi.spyOn(EventRepository, 'findById').mockResolvedValue(null)


    const response = await request(app).post(endpoint).send({
      eventId,
      email: cohostEmail,
      role: "Manager",
    });


    expect(response.status).toBe(HTTP_NOT_FOUND);
    expect(response.body).toHaveProperty('message', `Event not found or doesn't exists`);
  });




  it('Should validate that the user exists on the platform; if not, return a message: "User not found or does not exist"', async () => {
    currentTestRole = Role.CREATOR;
    vi.spyOn(EventRepository, 'findById').mockResolvedValue({ ...FAKE_EVENT, Cohost: [] } as any);


    vi.spyOn(UserRepository, 'findbyEmail').mockResolvedValue(null);

    const response = await request(app).post(endpoint).send({
      eventId,
      email: cohostEmail,
      role: "Manager",
    });


    expect(response.status).toBe(HTTP_NOT_FOUND);
    expect(response.body).toHaveProperty('message', `User not found or does not exist`);
  });

  it('Should return 500 Internal Server Error if the database operation fails.', async () => {
    currentTestRole = Role.CREATOR;
    vi.spyOn(EventRepository, 'findById').mockRejectedValue(new Error('Database error'));



    const response = await request(app).post(endpoint).send({
      eventId,
      email: cohostEmail,
      role: "Manager",
    });


    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'We are experiencing high traffic, please try again later');
  });


});