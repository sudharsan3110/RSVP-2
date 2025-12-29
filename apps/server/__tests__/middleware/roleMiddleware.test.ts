import { roleMiddleware } from '@/middleware/roleMiddleware';
import { UserRepository } from '@/repositories/user.repository';
import { TokenExpiredError } from '@/utils/apiError';
import { UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories/user.repository');

vi.mock('@/utils/catchAsync', () => ({
  default: (fn: Function) => fn,
}));

describe('roleMiddleware', () => {
  let mockReq: Partial<Request> & { userId?: string; userRole?: UserRole };
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  const TEST_USER_ID = 'test-user-123';
  const TEST_ROLE = 'ADMIN' as UserRole;

  beforeEach(() => {
    mockReq = {
      userId: TEST_USER_ID,
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call next() and set userRole if user has the required role', async () => {
    vi.mocked(UserRepository.findRoleByUserId).mockResolvedValue({
      id: TEST_USER_ID,
      role: TEST_ROLE,
    } as any);

    const middleware = roleMiddleware(TEST_ROLE);
    await middleware(mockReq as any, mockRes as any, mockNext);

    expect(UserRepository.findRoleByUserId).toHaveBeenCalledWith(TEST_USER_ID, TEST_ROLE);
    expect(mockReq.userRole).toBe(TEST_ROLE);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('should return 403 if user does not have the required role', async () => {
    vi.mocked(UserRepository.findRoleByUserId).mockResolvedValue(null);

    const middleware = roleMiddleware(TEST_ROLE);
    await middleware(mockReq as any, mockRes as any, mockNext);

    expect(UserRepository.findRoleByUserId).toHaveBeenCalledWith(TEST_USER_ID, TEST_ROLE);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized access' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw TokenExpiredError if userId is missing from request', async () => {
    mockReq.userId = undefined;
    const middleware = roleMiddleware(TEST_ROLE);
    await expect(middleware(mockReq as any, mockRes as any, mockNext)).rejects.toThrow(
      TokenExpiredError
    );
    expect(UserRepository.findRoleByUserId).not.toHaveBeenCalled();
  });
});
