import { AttendeeRepository } from '@/repositories/attendee.repository';
import { prisma } from '@/utils/connection';
import {
  ATTENDEE_COUNT_GOING,
  ATTENDEE_ID,
  END_DATE,
  EVENT_ID,
  EVENT_NO_ATTENDEES,
  INVALID_TOKEN,
  MOCK_ATTENDEE,
  MOCK_ATTENDEE_CANCELLED,
  MOCK_ATTENDEE_GOING,
  MOCK_ATTENDEE_RESTORED,
  MOCK_ATTENDEE_WAITING,
  MOCK_ATTENDEE_WITH_USER,
  MOCK_ATTENDEE_WITH_USER_NO_EVENT,
  MOCK_ATTENDEES_WITH_DETAILS,
  MOCK_CREATED_ATTENDEE,
  MOCK_EVENT_DATA,
  MOCK_MULTIPLE_ATTENDEES,
  MOCK_NEW_ATTENDEE_DATA,
  MOCK_UPDATE_MULTIPLE_RESULT,
  MOCK_UPDATED_ATTENDEE,
  NON_EXISTENT_ID,
  QR_TOKEN,
  START_DATE,
  USER_ID,
} from '@/utils/testConstants';
import { AttendeeStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/connection', () => ({
  prisma: {
    attendee: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('@/utils/pagination', () => {
  return {
    Paginator: vi.fn().mockImplementation(() => ({
      paginate: vi.fn(),
    })),
  };
});

describe('AttendeeRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic CRUD & Lookup Methods', () => {
    describe('findById', () => {
      it('returns the attendee when the ID exists and isDeleted: false', async () => {
        vi.mocked(prisma.attendee.findUnique).mockResolvedValue(MOCK_ATTENDEE as any);

        const result = await AttendeeRepository.findById(ATTENDEE_ID);

        expect(result).toEqual(MOCK_ATTENDEE);
        expect(prisma.attendee.findUnique).toHaveBeenCalledWith({
          where: { id: ATTENDEE_ID, isDeleted: false },
        });
      });

      it('returns null when the ID exists but isDeleted: true (Soft Delete check)', async () => {
        vi.mocked(prisma.attendee.findUnique).mockResolvedValue(null);

        const result = await AttendeeRepository.findById(ATTENDEE_ID);

        expect(result).toBeNull();
      });

      it('returns null when the ID does not exist', async () => {
        vi.mocked(prisma.attendee.findUnique).mockResolvedValue(null);

        const result = await AttendeeRepository.findById(NON_EXISTENT_ID);

        expect(result).toBeNull();
      });
    });

    describe('findByQrToken', () => {
      it('returns attendee including correct user details for a valid token/event ID', async () => {
        vi.mocked(prisma.attendee.findUnique).mockResolvedValue(MOCK_ATTENDEE_WITH_USER as any);

        const result = await AttendeeRepository.findByQrToken(QR_TOKEN, EVENT_ID);

        expect(result).toEqual(MOCK_ATTENDEE_WITH_USER);
        expect(prisma.attendee.findUnique).toHaveBeenCalledWith({
          where: { qrToken: QR_TOKEN, eventId: EVENT_ID, isDeleted: false },
          include: {
            user: {
              select: {
                fullName: true,
                primaryEmail: true,
                contact: true,
                profileIcon: true,
              },
            },
          },
        });
      });

      it('returns attendee for a valid token when eventId is not provided', async () => {
        vi.mocked(prisma.attendee.findUnique).mockResolvedValue(
          MOCK_ATTENDEE_WITH_USER_NO_EVENT as any
        );

        const result = await AttendeeRepository.findByQrToken(QR_TOKEN);

        expect(result).toEqual(MOCK_ATTENDEE_WITH_USER_NO_EVENT);
        expect(prisma.attendee.findUnique).toHaveBeenCalledWith({
          where: { qrToken: QR_TOKEN, eventId: undefined, isDeleted: false },
          include: {
            user: {
              select: {
                fullName: true,
                primaryEmail: true,
                contact: true,
                profileIcon: true,
              },
            },
          },
        });
      });

      it('returns null when the token is not found', async () => {
        vi.mocked(prisma.attendee.findUnique).mockResolvedValue(null);

        const result = await AttendeeRepository.findByQrToken(INVALID_TOKEN);

        expect(result).toBeNull();
      });
    });

    describe('findByUserIdAndEventId', () => {
      it('returns the attendee for existing user/event ID pair', async () => {
        vi.mocked(prisma.attendee.findFirst).mockResolvedValue(MOCK_ATTENDEE as any);

        const result = await AttendeeRepository.findByUserIdAndEventId(USER_ID, EVENT_ID);

        expect(result).toEqual(MOCK_ATTENDEE);
        expect(prisma.attendee.findFirst).toHaveBeenCalledWith({
          where: {
            userId: USER_ID,
            eventId: EVENT_ID,
            isDeleted: false,
          },
        });
      });

      it('returns null when the record does not exist', async () => {
        vi.mocked(prisma.attendee.findFirst).mockResolvedValue(null);

        const result = await AttendeeRepository.findByUserIdAndEventId(USER_ID, EVENT_ID);

        expect(result).toBeNull();
      });

      it('handles isDeleted parameter when set to null', async () => {
        vi.mocked(prisma.attendee.findFirst).mockResolvedValue(null);

        await AttendeeRepository.findByUserIdAndEventId(USER_ID, EVENT_ID, null);

        expect(prisma.attendee.findFirst).toHaveBeenCalledWith({
          where: {
            userId: USER_ID,
            eventId: EVENT_ID,
            isDeleted: undefined,
          },
        });
      });
    });

    describe('create', () => {
      it('creates a new attendee record and returns it', async () => {
        vi.mocked(prisma.attendee.create).mockResolvedValue(MOCK_CREATED_ATTENDEE as any);

        const result = await AttendeeRepository.create(MOCK_NEW_ATTENDEE_DATA as any);

        expect(result).toEqual(MOCK_CREATED_ATTENDEE);
        expect(prisma.attendee.create).toHaveBeenCalledWith({
          data: MOCK_NEW_ATTENDEE_DATA,
        });
      });
    });

    describe('update', () => {
      it('updates an existing attendee record and returns the updated data', async () => {
        const updateData = { status: AttendeeStatus.CANCELLED };

        vi.mocked(prisma.attendee.update).mockResolvedValue(MOCK_UPDATED_ATTENDEE as any);

        const result = await AttendeeRepository.update(ATTENDEE_ID, updateData as any);

        expect(result).toEqual(MOCK_UPDATED_ATTENDEE);
        expect(prisma.attendee.update).toHaveBeenCalledWith({
          where: { id: ATTENDEE_ID, isDeleted: false },
          data: updateData,
        });
      });
    });
  });

  describe('Bulk/List Retrieval & Filtering', () => {
    describe('findAllByEventId', () => {
      it('retrieves all non-deleted attendees for a given eventId', async () => {
        vi.mocked(prisma.attendee.findMany).mockResolvedValue(MOCK_MULTIPLE_ATTENDEES as any);

        const result = await AttendeeRepository.findAllByEventId(EVENT_ID);

        expect(result).toEqual(MOCK_MULTIPLE_ATTENDEES);
        expect(prisma.attendee.findMany).toHaveBeenCalledWith({
          where: { eventId: EVENT_ID, isDeleted: false },
        });
      });

      it('returns an empty array if the event has no attendees', async () => {
        vi.mocked(prisma.attendee.findMany).mockResolvedValue([]);

        const result = await AttendeeRepository.findAllByEventId(EVENT_NO_ATTENDEES);

        expect(result).toEqual([]);
      });
    });

    describe('findAllAttendees', () => {
      it('returns all non-deleted attendees with correct user details included', async () => {
        vi.mocked(prisma.attendee.findMany).mockResolvedValue(MOCK_ATTENDEES_WITH_DETAILS as any);

        const result = await AttendeeRepository.findAllAttendees(EVENT_ID);

        expect(result).toEqual(MOCK_ATTENDEES_WITH_DETAILS);
        expect(prisma.attendee.findMany).toHaveBeenCalledWith({
          where: {
            eventId: EVENT_ID,
            isDeleted: false,
          },
          include: {
            user: {
              select: {
                fullName: true,
                primaryEmail: true,
                contact: true,
              },
            },
          },
        });
      });
    });

    describe('countAttendees', () => {
      it('correctly counts only attendees with status: GOING', async () => {
        vi.mocked(prisma.attendee.count).mockResolvedValue(ATTENDEE_COUNT_GOING);

        const result = await AttendeeRepository.countAttendees(EVENT_ID);

        expect(result).toBe(ATTENDEE_COUNT_GOING);
        expect(prisma.attendee.count).toHaveBeenCalledWith({
          where: { eventId: EVENT_ID, status: 'GOING' },
        });
      });
    });
  });

  describe('Complex Query Methods', () => {
    describe('findRegisteredEventsByUser', () => {
      const mockParams = {
        userId: USER_ID,
        page: 1,
        limit: 10,
      };

      it('returns events correctly for a user without date filters', async () => {
        vi.mocked(prisma.attendee.findMany).mockResolvedValue([{ event: MOCK_EVENT_DATA }] as any);
        vi.mocked(prisma.attendee.count).mockResolvedValue(1);

        const result = await AttendeeRepository.findRegisteredEventsByUser(mockParams);

        expect(prisma.attendee.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              userId: USER_ID,
              isDeleted: false,
              AND: { event: { isDeleted: false } },
            },
            skip: 0,
            take: 10,
            orderBy: { event: { startTime: 'asc' } },
          })
        );

        expect(result).toEqual({
          events: [MOCK_EVENT_DATA],
          metadata: {
            totalItems: 1,
            totalPages: 1,
            currentPage: 1,
          },
        });
      });

      it('correctly filters events using only startDate (events starting on/after date)', async () => {
        vi.mocked(prisma.attendee.findMany).mockResolvedValue([]);
        vi.mocked(prisma.attendee.count).mockResolvedValue(0);

        await AttendeeRepository.findRegisteredEventsByUser({
          ...mockParams,
          startDate: START_DATE,
        });

        expect(prisma.attendee.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              event: {
                OR: [
                  { startTime: { gte: START_DATE } },
                  { startTime: { lt: START_DATE }, endTime: { gt: START_DATE } },
                ],
              },
            }),
          })
        );
      });

      it('correctly filters events using only endDate (events starting before/on date)', async () => {
        vi.mocked(prisma.attendee.findMany).mockResolvedValue([]);
        vi.mocked(prisma.attendee.count).mockResolvedValue(0);

        await AttendeeRepository.findRegisteredEventsByUser({
          ...mockParams,
          endDate: END_DATE,
        });

        expect(prisma.attendee.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              event: {
                startTime: { lte: END_DATE },
              },
            }),
          })
        );
      });

      it('handles both startDate and endDate simultaneously', async () => {
        vi.mocked(prisma.attendee.findMany).mockResolvedValue([]);
        vi.mocked(prisma.attendee.count).mockResolvedValue(0);

        await AttendeeRepository.findRegisteredEventsByUser({
          ...mockParams,
          startDate: START_DATE,
          endDate: END_DATE,
        });

        expect(prisma.attendee.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              event: {
                AND: [
                  {
                    OR: [
                      { startTime: { gte: START_DATE } },
                      { startTime: { lt: START_DATE }, endTime: { gt: START_DATE } },
                    ],
                  },
                  {
                    startTime: { lte: END_DATE },
                  },
                ],
              },
            }),
          })
        );
      });

      it('verifies pagination works and metadata is accurate', async () => {
        const totalItems = 25;
        const page = 2;
        const limit = 10;

        vi.mocked(prisma.attendee.findMany).mockResolvedValue([]);
        vi.mocked(prisma.attendee.count).mockResolvedValue(totalItems);

        const result = await AttendeeRepository.findRegisteredEventsByUser({
          userId: USER_ID,
          page,
          limit,
        });

        expect(prisma.attendee.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 10,
            take: 10,
          })
        );

        expect(result.metadata).toEqual({
          totalItems: 25,
          totalPages: 3,
          currentPage: 2,
        });
      });
    });

    describe('findAttendeesByEventId', () => {
      const mockPaginate = vi.fn();

      beforeEach(() => {
        AttendeeRepository.attendeePaginator.paginate = mockPaginate;
        mockPaginate.mockResolvedValue({ data: [], meta: {} });
      });

      it('verifies basic pagination (page, limit) and sorting (sortBy, sortOrder) work', async () => {
        const params = {
          eventId: EVENT_ID,
          page: 2,
          limit: 20,
          sortBy: 'status',
          sortOrder: 'asc' as const,
        };

        await AttendeeRepository.findAttendeesByEventId(params);

        expect(mockPaginate).toHaveBeenCalledWith(
          { page: 2, limit: 20, sortBy: 'status', sortOrder: 'asc' },
          expect.anything()
        );
      });

      it('filters by hasAttended: true', async () => {
        await AttendeeRepository.findAttendeesByEventId({
          eventId: EVENT_ID,
          hasAttended: true,
        });

        expect(mockPaginate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            where: expect.objectContaining({
              hasAttended: true,
            }),
          })
        );
      });

      it('filters by status (e.g., [GOING, WAITING])', async () => {
        const statuses = [AttendeeStatus.GOING, AttendeeStatus.WAITING];

        await AttendeeRepository.findAttendeesByEventId({
          eventId: EVENT_ID,
          status: statuses,
        });

        expect(mockPaginate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            where: expect.objectContaining({
              status: { in: statuses },
            }),
          })
        );
      });

      it('performs full-text search by fullName, primaryEmail, or secondaryEmail', async () => {
        const searchTerm = 'John';

        await AttendeeRepository.findAttendeesByEventId({
          eventId: EVENT_ID,
          search: searchTerm,
        });

        expect(mockPaginate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            where: expect.objectContaining({
              user: {
                OR: [
                  { fullName: { contains: searchTerm } },
                  { primaryEmail: { contains: searchTerm } },
                  { secondaryEmail: { contains: searchTerm } },
                ],
              },
            }),
          })
        );
      });
    });
  });

  describe('Status & Delete Operations', () => {
    describe('updateAttendeeStatus', () => {
      it('correctly updates status to GOING when allowedStatus: true', async () => {
        vi.mocked(prisma.attendee.update).mockResolvedValue(MOCK_ATTENDEE_GOING as any);

        const result = await AttendeeRepository.updateAttendeeStatus(ATTENDEE_ID, true);

        expect(result).toEqual(MOCK_ATTENDEE_GOING);
        expect(prisma.attendee.update).toHaveBeenCalledWith({
          where: {
            id: ATTENDEE_ID,
            isDeleted: false,
          },
          data: {
            allowedStatus: true,
            status: AttendeeStatus.GOING,
          },
        });
      });

      it('correctly updates status to WAITING when allowedStatus: false', async () => {
        vi.mocked(prisma.attendee.update).mockResolvedValue(MOCK_ATTENDEE_WAITING as any);

        const result = await AttendeeRepository.updateAttendeeStatus(ATTENDEE_ID, false);

        expect(result).toEqual(MOCK_ATTENDEE_WAITING);
        expect(prisma.attendee.update).toHaveBeenCalledWith({
          where: {
            id: ATTENDEE_ID,
            isDeleted: false,
          },
          data: {
            allowedStatus: false,
            status: AttendeeStatus.WAITING,
          },
        });
      });
    });

    describe('updateMultipleAttendeesStatus', () => {
      it('updates multiple attendees to the target status', async () => {
        const whereClause = { eventId: EVENT_ID, status: AttendeeStatus.WAITING };
        const targetStatus = AttendeeStatus.GOING;

        vi.mocked(prisma.attendee.updateMany).mockResolvedValue(MOCK_UPDATE_MULTIPLE_RESULT as any);

        const result = await AttendeeRepository.updateMultipleAttendeesStatus(
          whereClause,
          targetStatus
        );

        expect(result).toEqual(MOCK_UPDATE_MULTIPLE_RESULT);
        expect(prisma.attendee.updateMany).toHaveBeenCalledWith({
          where: {
            ...whereClause,
            isDeleted: false,
          },
          data: {
            allowedStatus: true,
            status: targetStatus,
          },
        });
      });
    });

    describe('cancel', () => {
      it('sets status to CANCELLED, isDeleted to true, and allowedStatus to false', async () => {
        vi.mocked(prisma.attendee.update).mockResolvedValue(MOCK_ATTENDEE_CANCELLED as any);

        const result = await AttendeeRepository.cancel(ATTENDEE_ID);

        expect(result).toEqual(MOCK_ATTENDEE_CANCELLED);
        expect(prisma.attendee.update).toHaveBeenCalledWith({
          where: { id: ATTENDEE_ID, isDeleted: false },
          data: {
            status: AttendeeStatus.CANCELLED,
            isDeleted: true,
            allowedStatus: false,
          },
        });
      });
    });

    describe('restore', () => {
      it('resets isDeleted to false and updates status and allowedStatus to provided values', async () => {
        vi.mocked(prisma.attendee.update).mockResolvedValue(MOCK_ATTENDEE_RESTORED as any);

        const result = await AttendeeRepository.restore(ATTENDEE_ID, AttendeeStatus.GOING, true);

        expect(result).toEqual(MOCK_ATTENDEE_RESTORED);
        expect(prisma.attendee.update).toHaveBeenCalledWith({
          where: {
            id: ATTENDEE_ID,
            isDeleted: true,
            status: AttendeeStatus.CANCELLED,
          },
          data: {
            status: AttendeeStatus.GOING,
            isDeleted: false,
            allowedStatus: true,
          },
        });
      });
    });
  });
});
