import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/utils/connection';
import { HostRole } from '@prisma/client';
import { StatRepository } from '@/repositories/stat.repository';

vi.mock('@/utils/connection', () => ({
  prisma: {
    user: {
      count: vi.fn(),
    },
    host: {
      count: vi.fn(),
    },
    event: {
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    attendee: {
      count: vi.fn(),
    },
  },
}));

describe('StatRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTotalUsersCount', () => {
    it('should return the count of non-deleted users', async () => {
      const mockCount = 150;
      vi.mocked(prisma.user.count).mockResolvedValue(mockCount);
      const result = await StatRepository.getTotalUsersCount();
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
      expect(result).toBe(mockCount);
    });
  });

  describe('getHostStatusCounts', () => {
    it('should return the count of non-deleted hosts with CREATOR role', async () => {
      const mockCount = 42;
      vi.mocked(prisma.host.count).mockResolvedValue(mockCount);
      const result = await StatRepository.getHostStatusCounts();
      expect(prisma.host.count).toHaveBeenCalledWith({
        where: { isDeleted: false, role: HostRole.CREATOR },
      });
      expect(result).toBe(mockCount);
    });
  });

  describe('getEventStatusCounts', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-05-10T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return aggregated event statistics correctly', async () => {
      const mockDate = new Date();
      vi.mocked(prisma.event.count)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(75);

      vi.mocked(prisma.attendee.count).mockResolvedValue(300);
      vi.mocked(prisma.event.aggregate).mockResolvedValue({
        _sum: { capacity: 5000 },
      } as any);

      const result = await StatRepository.getEventStatusCounts();
      expect(result).toEqual({
        totalEvents: 100,
        upcomingEvents: 20,
        ongoingEvents: 5,
        completedEvents: 75,
        usedTickets: 300,
        totalTickets: 5000,
      });

      expect(prisma.event.count).toHaveBeenNthCalledWith(2, {
        where: {
          isDeleted: false,
          isActive: true,
          startTime: { gt: mockDate },
        },
      });

      expect(prisma.event.count).toHaveBeenNthCalledWith(3, {
        where: {
          isDeleted: false,
          isActive: true,
          startTime: { lte: mockDate },
          endTime: { gte: mockDate },
        },
      });
    });

    it('should handle null capacity aggregate safely', async () => {
      vi.mocked(prisma.event.count).mockResolvedValue(0);
      vi.mocked(prisma.attendee.count).mockResolvedValue(0);
      vi.mocked(prisma.event.aggregate).mockResolvedValue({
        _sum: { capacity: null },
      } as any);
      const result = await StatRepository.getEventStatusCounts();
      expect(result.totalTickets).toBe(0);
    });
  });
});
