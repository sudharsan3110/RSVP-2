import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { getAllStatsController } from '@/controllers/stat.controller';
import { StatRepository } from '@/repositories/stat.repository';
import { TokenExpiredError } from '@/utils/apiError';

vi.mock('@/repositories/stat.repository', () => ({
  StatRepository: {
    getTotalUsersCount: vi.fn(),
    getHostStatusCounts: vi.fn(),
    getEventStatusCounts: vi.fn(),
  },
}));

vi.mock('@/utils/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/utils/apiResponse', () => {
  return {
    SuccessResponse: vi.fn().mockImplementation((message, data) => {
      return {
        send: (res: any) => {
          res.status(200).json({ message, data });
          return res;
        },
      };
    }),
  };
});

describe('Stat Controller', () => {
  let mockReq: Partial<Request> & { userId?: string };
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      userId: 'test-user-id',
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as unknown as Response;
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllStatsController', () => {
    it('should return all stats successfully', async () => {
      const mockTotalUsers = 100;
      const mockTotalHosts = 20;
      const mockEventStats = {
        totalEvents: 50,
        upcomingEvents: 10,
        ongoingEvents: 5,
        completedEvents: 35,
        totalTickets: 500,
        usedTickets: 200,
      };

      vi.mocked(StatRepository.getTotalUsersCount).mockResolvedValue(mockTotalUsers);
      vi.mocked(StatRepository.getHostStatusCounts).mockResolvedValue(mockTotalHosts);
      vi.mocked(StatRepository.getEventStatusCounts).mockResolvedValue(mockEventStats);

      await getAllStatsController(mockReq as Request, mockRes as Response, mockNext);

      expect(StatRepository.getTotalUsersCount).toHaveBeenCalled();
      expect(StatRepository.getHostStatusCounts).toHaveBeenCalled();
      expect(StatRepository.getEventStatusCounts).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'success',
          data: {
            totalUsers: mockTotalUsers,
            totalHosts: mockTotalHosts,
            ...mockEventStats,
          },
        })
      );
    });

    it('should throw TokenExpiredError if userId is missing', async () => {
      mockReq.userId = undefined;
      await getAllStatsController(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(TokenExpiredError));
      expect(StatRepository.getTotalUsersCount).not.toHaveBeenCalled();
    });

    it('should handle errors from repository', async () => {
      const error = new Error('Database error');
      vi.mocked(StatRepository.getTotalUsersCount).mockRejectedValue(error);
      await getAllStatsController(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
