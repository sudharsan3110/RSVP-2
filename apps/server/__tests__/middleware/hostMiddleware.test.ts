import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { eventManageMiddleware } from '@/middleware/hostMiddleware';
import { CohostRepository } from '@/repositories/cohost.repository';
import { HostRole } from '@prisma/client';

import { describe, expect, it, vi, beforeEach } from 'vitest';

interface AuthenticatedRequest extends Request {
  userId?: string;
  Role?: HostRole;
}

vi.mock('@/repositories/cohost.repository', () => ({
  CohostRepository: {
    FindhostOrCohost: vi.fn(),
  },
}));

describe('eventManageMiddleware', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());

    app.post(
      '/event/:eventId',
      (req: Request, res: Response, next: NextFunction) => {
        (req as AuthenticatedRequest).userId = 'mock-user-123';
        next();
      },
      eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
      (req: Request, res: Response) => {
        res.status(200).json({
          message: 'Access granted',
          role: (req as AuthenticatedRequest).Role,
        });
      }
    );

    app.post(
      '/event-from-body',
      (req: Request, res: Response, next: NextFunction) => {
        (req as AuthenticatedRequest).userId = 'mock-user-123';
        next();
      },
      eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
      (req: Request, res: Response) => {
        res.status(200).json({
          message: 'Access granted',
          role: (req as AuthenticatedRequest).Role,
        });
      }
    );

    app.post(
      '/event-no-user/:eventId',
      eventManageMiddleware([HostRole.CREATOR, HostRole.MANAGER]),
      (req: Request, res: Response) => {
        res.status(200).json({
          message: 'Access granted',
          role: (req as AuthenticatedRequest).Role,
        });
      }
    );

    app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
      res.status(500).json({ message: 'Internal server error' });
    });
  });

  describe('Event ID validation', () => {
    it('should return 400 when eventId is missing in both params and body', async () => {
      const res = await request(app).post('/event-from-body').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Event ID is required');
    });

    it('should work when eventId is provided in params', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(HostRole.CREATOR);

      const res = await request(app).post('/event/event-123').send({});

      expect(res.status).toBe(200);
      expect(res.body.role).toBe(HostRole.CREATOR);
      expect(CohostRepository.FindhostOrCohost).toHaveBeenCalledWith(
        'mock-user-123',
        'event-123',
        [HostRole.CREATOR, HostRole.MANAGER],
        true
      );
    });

    it('should work when eventId is provided in body', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(HostRole.MANAGER);
      const res = await request(app).post('/event-from-body').send({ eventId: 'event-456' });

      expect(res.status).toBe(200);
      expect(res.body.role).toBe(HostRole.MANAGER);
      expect(CohostRepository.FindhostOrCohost).toHaveBeenCalledWith(
        'mock-user-123',
        'event-456',
        [HostRole.CREATOR, HostRole.MANAGER],
        true
      );
    });

    it('should prioritize params eventId over body eventId', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(HostRole.CREATOR);

      const res = await request(app)
        .post('/event/event-from-params')
        .send({ eventId: 'event-from-body' });

      expect(res.status).toBe(200);
      expect(CohostRepository.FindhostOrCohost).toHaveBeenCalledWith(
        'mock-user-123',
        'event-from-params',
        [HostRole.CREATOR, HostRole.MANAGER],
        true
      );
    });
  });

  describe('Authorization', () => {
    it('should return 403 when user does not have required role', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(null as any);

      const res = await request(app).post('/event/event-123').send({});

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Unauthorized access');
    });

    it('should grant access when user has CREATOR role', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(HostRole.CREATOR);

      const res = await request(app).post('/event/event-123').send({});

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Access granted');
      expect(res.body.role).toBe(HostRole.CREATOR);
    });

    it('should grant access when user has MANAGER role', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(HostRole.MANAGER);

      const res = await request(app).post('/event/event-123').send({});

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Access granted');
      expect(res.body.role).toBe(HostRole.MANAGER);
    });

    it('should attach role to request object', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(HostRole.CREATOR);

      const res = await request(app).post('/event/event-123').send({});

      expect(res.status).toBe(200);
      expect(res.body.role).toBe(HostRole.CREATOR);
    });

    it('should handle missing userId', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(null as any);

      const res = await request(app).post('/event-no-user/event-123').send({});

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Unauthorized access');
      expect(CohostRepository.FindhostOrCohost).toHaveBeenCalledWith(
        undefined,
        'event-123',
        [HostRole.CREATOR, HostRole.MANAGER],
        true
      );
    });
  });

  describe('Role restrictions', () => {
    it('should only allow specified roles', async () => {
      const restrictiveApp = express();
      restrictiveApp.use(express.json());

      restrictiveApp.post(
        '/event/:eventId',
        (req: Request, res: Response, next: NextFunction) => {
          (req as AuthenticatedRequest).userId = 'mock-user-123';
          next();
        },
        eventManageMiddleware([HostRole.CREATOR]),
        (req: Request, res: Response) => {
          res.status(200).json({ message: 'Access granted' });
        }
      );

      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(null as any);

      const res = await request(restrictiveApp).post('/event/event-123').send({});

      expect(res.status).toBe(403);
      expect(CohostRepository.FindhostOrCohost).toHaveBeenCalledWith(
        'mock-user-123',
        'event-123',
        [HostRole.CREATOR],
        true
      );
    });
  });

  describe('Error handling', () => {
    it('should return 500 when repository throws an error', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockRejectedValue(
        new Error('Database connection failed')
      );

      const res = await request(app).post('/event/event-123').send({});

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Internal server error');
    });

    it('should handle unexpected repository responses', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(undefined as any);

      const res = await request(app).post('/event/event-123').send({});

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Unauthorized access');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string eventId', async () => {
      const res = await request(app).post('/event-from-body').send({ eventId: '' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Event ID is required');
    });

    it('should handle numeric eventId', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(HostRole.CREATOR);

      const res = await request(app).post('/event/12345').send({});

      expect(res.status).toBe(200);
      expect(CohostRepository.FindhostOrCohost).toHaveBeenCalledWith(
        'mock-user-123',
        '12345',
        [HostRole.CREATOR, HostRole.MANAGER],
        true
      );
    });

    it('should handle special characters in eventId', async () => {
      vi.mocked(CohostRepository.FindhostOrCohost).mockResolvedValue(HostRole.CREATOR);

      const res = await request(app).post('/event/event-with-dashes-123').send({});

      expect(res.status).toBe(200);
      expect(CohostRepository.FindhostOrCohost).toHaveBeenCalledWith(
        'mock-user-123',
        'event-with-dashes-123',
        [HostRole.CREATOR, HostRole.MANAGER],
        true
      );
    });
  });
});
