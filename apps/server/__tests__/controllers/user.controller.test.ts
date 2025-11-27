import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '@/repositories/user.repository';
import logger from '@/utils/logger';
import { prisma } from '@/utils/connection';
import {
  getUserPublicController,
  updateUserProfileController,
  deleteUserController,
} from '@/controllers/user.controller';
import { NotFoundError, BadRequestError } from '@/utils/apiError';

const TEST_USER_ID = 'test-user-123';

describe('user controller - updateUserProfileController', () => {
  let mockReq: Partial<Request> & { userId?: string; body: any };
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      userId: TEST_USER_ID,
      body: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
      locals: {},
    };

    mockNext = vi.fn();

    vi.spyOn(logger, 'info').mockImplementation(() => logger);
    vi.spyOn(logger, 'error').mockImplementation(() => logger);
    vi.spyOn(prisma.socialLink, 'upsert').mockResolvedValue({} as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully update user profile with full profile data', async () => {
    const profileData = {
      fullName: 'John Doe',
      location: 'San Francisco',
      bio: 'Software developer',
      profileIcon: 2,
    };

    mockReq.body = profileData;

    const mockUpdatedUser = {
      id: TEST_USER_ID,
      fullName: profileData.fullName,
      location: profileData.location,
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
      contact: null,
      isCompleted: false,
    };

    vi.spyOn(UserRepository, 'updateProfile').mockResolvedValue(mockUpdatedUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    expect(UserRepository.updateProfile).toHaveBeenCalledWith(TEST_USER_ID, profileData);
    expect(mockRes.json).toHaveBeenCalled();

    const responseData = (mockRes.json as any).mock.calls[0][0];
    expect(responseData).toHaveProperty('data');
    expect(responseData.data).toEqual(mockUpdatedUser);
  });

  it('should update profile and upsert all three social links', async () => {
    const profileData = {
      fullName: 'Jane Doe',
      location: 'New York',
      bio: 'Designer and developer',
      profileIcon: 3,
      website: 'https://janedoe.com',
      instagram: 'janedoe_design',
      twitter: '@janedoe',
    };

    mockReq.body = profileData;

    const mockUpdatedUser = {
      id: TEST_USER_ID,
      fullName: profileData.fullName,
      location: profileData.location,
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
      contact: null,
      isCompleted: false,
    };

    vi.spyOn(UserRepository, 'updateProfile').mockResolvedValue(mockUpdatedUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    // Verify all three social links were upserted
    expect(prisma.socialLink.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_type: { userId: TEST_USER_ID, type: 'PERSONAL_WEBSITE' } },
        update: { handle: 'https://janedoe.com' },
        create: { userId: TEST_USER_ID, type: 'PERSONAL_WEBSITE', handle: 'https://janedoe.com' },
      })
    );

    expect(prisma.socialLink.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_type: { userId: TEST_USER_ID, type: 'INSTAGRAM' } },
        update: { handle: 'janedoe_design' },
        create: { userId: TEST_USER_ID, type: 'INSTAGRAM', handle: 'janedoe_design' },
      })
    );

    expect(prisma.socialLink.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_type: { userId: TEST_USER_ID, type: 'TWITTER' } },
        update: { handle: '@janedoe' },
        create: { userId: TEST_USER_ID, type: 'TWITTER', handle: '@janedoe' },
      })
    );

    // Verify profile was updated without social links data
    expect(UserRepository.updateProfile).toHaveBeenCalledWith(TEST_USER_ID, {
      fullName: profileData.fullName,
      location: profileData.location,
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
    });

    expect(mockRes.json).toHaveBeenCalled();
  });

  it('should update profile and upsert only website when provided', async () => {
    const profileData = {
      fullName: 'Bob Smith',
      location: 'Austin',
      bio: 'Tech enthusiast',
      profileIcon: 1,
      website: 'https://bobsmith.dev',
    };

    mockReq.body = profileData;

    const mockUpdatedUser = {
      id: TEST_USER_ID,
      fullName: profileData.fullName,
      location: profileData.location,
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
      contact: null,
      isCompleted: false,
    };

    vi.spyOn(UserRepository, 'updateProfile').mockResolvedValue(mockUpdatedUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    // Only website social link should be upserted (once, not three times)
    expect(prisma.socialLink.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.socialLink.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_type: { userId: TEST_USER_ID, type: 'PERSONAL_WEBSITE' } },
      })
    );

    expect(UserRepository.updateProfile).toHaveBeenCalledWith(TEST_USER_ID, {
      fullName: profileData.fullName,
      location: profileData.location,
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
    });
  });

  it('should update profile and upsert only instagram when provided', async () => {
    const profileData = {
      fullName: 'Carol White',
      location: 'Los Angeles',
      bio: 'Content creator',
      profileIcon: 2,
      instagram: 'carol_white',
    };

    mockReq.body = profileData;

    const mockUpdatedUser = {
      id: TEST_USER_ID,
      fullName: profileData.fullName,
      location: profileData.location,
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
      contact: null,
      isCompleted: false,
    };

    vi.spyOn(UserRepository, 'updateProfile').mockResolvedValue(mockUpdatedUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    // Only instagram social link should be upserted
    expect(prisma.socialLink.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.socialLink.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_type: { userId: TEST_USER_ID, type: 'INSTAGRAM' } },
      })
    );
  });

  it('should mark profile as completed when fullName, location, and contact are filled', async () => {
    const profileData = {
      fullName: 'Alice Johnson',
      location: 'Boston',
      bio: 'Engineer',
      profileIcon: 2,
    };

    mockReq.body = profileData;

    const mockUserBeforeCompletion = {
      id: TEST_USER_ID,
      fullName: 'Alice Johnson',
      location: 'Boston',
      bio: 'Engineer',
      profileIcon: 2,
      contact: '+1234567890',
      isCompleted: false,
    };

    const mockUserAfterCompletion = {
      ...mockUserBeforeCompletion,
      isCompleted: true,
    };

    vi.spyOn(UserRepository, 'updateProfile')
      .mockResolvedValueOnce(mockUserBeforeCompletion as any)
      .mockResolvedValueOnce(mockUserAfterCompletion as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    // Should call updateProfile twice - first for initial update, second for marking as completed
    expect(UserRepository.updateProfile).toHaveBeenCalledTimes(2);
    expect(UserRepository.updateProfile).toHaveBeenNthCalledWith(1, TEST_USER_ID, profileData);
    expect(UserRepository.updateProfile).toHaveBeenNthCalledWith(2, TEST_USER_ID, {
      isCompleted: true,
    });

    const responseData = (mockRes.json as any).mock.calls[0][0];
    expect(responseData.data.isCompleted).toBe(true);
  });
  it('should not mark profile as completed when contact field is null', async () => {
    const profileData = {
      fullName: 'Charlie Brown',
      location: 'Denver',
      bio: 'Designer',
      profileIcon: 1,
    };

    mockReq.body = profileData;

    const mockUpdatedUser = {
      id: TEST_USER_ID,
      fullName: profileData.fullName,
      location: profileData.location,
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
      contact: null, // Missing contact
      isCompleted: false,
    };

    vi.spyOn(UserRepository, 'updateProfile').mockResolvedValue(mockUpdatedUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    // Should only call updateProfile once (not twice) since profile is incomplete
    expect(UserRepository.updateProfile).toHaveBeenCalledTimes(1);
    expect(UserRepository.updateProfile).toHaveBeenCalledWith(TEST_USER_ID, profileData);

    const responseData = (mockRes.json as any).mock.calls[0][0];
    expect(responseData.data.isCompleted).toBe(false);
  });

  it('should successfully update user with contact number', async () => {
    const contactData = {
      contact: '+9876543210',
    };

    mockReq.body = contactData;

    const mockUser = {
      id: TEST_USER_ID,
      fullName: 'David Lee',
      location: 'Seattle',
      contact: contactData.contact,
      bio: 'Software architect',
      profileIcon: 2,
      isCompleted: false,
    };

    vi.spyOn(UserRepository, 'updateProfile').mockResolvedValue(mockUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    expect(UserRepository.updateProfile).toHaveBeenCalledWith(TEST_USER_ID, contactData);
    expect(mockRes.json).toHaveBeenCalled();

    const responseData = (mockRes.json as any).mock.calls[0][0];
    expect(responseData).toHaveProperty('data');
    expect(responseData.data.contact).toBe(contactData.contact);
  });

  it('should mark profile as completed when adding contact to profile with fullName and location', async () => {
    const contactData = {
      contact: '+1111111111',
    };

    mockReq.body = contactData;

    const mockUserWithAllFields = {
      id: TEST_USER_ID,
      fullName: 'Emma Wilson',
      location: 'Chicago',
      contact: '+1111111111',
      bio: 'Product manager',
      profileIcon: 3,
      isCompleted: false,
    };

    const mockCompletedUser = {
      ...mockUserWithAllFields,
      isCompleted: true,
    };

    vi.spyOn(UserRepository, 'updateProfile')
      .mockResolvedValueOnce(mockUserWithAllFields as any)
      .mockResolvedValueOnce(mockCompletedUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    expect(UserRepository.updateProfile).toHaveBeenCalledTimes(2);
    expect(UserRepository.updateProfile).toHaveBeenNthCalledWith(1, TEST_USER_ID, contactData);
    expect(UserRepository.updateProfile).toHaveBeenNthCalledWith(2, TEST_USER_ID, {
      isCompleted: true,
    });

    const responseData = (mockRes.json as any).mock.calls[0][0];
    expect(responseData.data.isCompleted).toBe(true);
  });

  it('should successfully update user with secondary email', async () => {
    const emailData = {
      secondaryEmail: 'user@example.com',
    };

    mockReq.body = emailData;

    const mockUser = {
      id: TEST_USER_ID,
      fullName: 'Frank Miller',
      location: 'Miami',
      contact: '+2222222222',
      secondaryEmail: emailData.secondaryEmail,
      bio: 'Developer',
      profileIcon: 1,
      isCompleted: true,
    };

    vi.spyOn(UserRepository, 'updateProfile').mockResolvedValue(mockUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    expect(UserRepository.updateProfile).toHaveBeenCalledWith(TEST_USER_ID, emailData);
    expect(mockRes.json).toHaveBeenCalled();

    const responseData = (mockRes.json as any).mock.calls[0][0];
    expect(responseData.data.secondaryEmail).toBe(emailData.secondaryEmail);
  });

  it('should update profile and upsert only twitter when provided', async () => {
    const profileData = {
      fullName: 'Grace Lee',
      location: 'Portland',
      bio: 'Tech writer',
      profileIcon: 2,
      twitter: '@gracelee',
    };

    mockReq.body = profileData;

    const mockUpdatedUser = {
      id: TEST_USER_ID,
      fullName: profileData.fullName,
      location: profileData.location,
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
      contact: null,
      isCompleted: false,
    };

    vi.spyOn(UserRepository, 'updateProfile').mockResolvedValue(mockUpdatedUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    // Only twitter social link should be upserted
    expect(prisma.socialLink.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.socialLink.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_type: { userId: TEST_USER_ID, type: 'TWITTER' } },
      })
    );

    expect(UserRepository.updateProfile).toHaveBeenCalledWith(TEST_USER_ID, {
      fullName: profileData.fullName,
      location: profileData.location,
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
    });
  });

  it('should update profile and upsert only website and instagram when provided', async () => {
    const profileData = {
      fullName: 'Henry Davis',
      location: 'Phoenix',
      bio: 'Developer and blogger',
      profileIcon: 1,
      website: 'https://henrydavis.com',
      instagram: 'henrydavis_dev',
    };

    mockReq.body = profileData;

    const mockUpdatedUser = {
      id: TEST_USER_ID,
      fullName: profileData.fullName,
      location: profileData.location,
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
      contact: null,
      isCompleted: false,
    };

    vi.spyOn(UserRepository, 'updateProfile').mockResolvedValue(mockUpdatedUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    // Only website and instagram should be upserted (2 times, not 3)
    expect(prisma.socialLink.upsert).toHaveBeenCalledTimes(2);

    const calls = (prisma.socialLink.upsert as any).mock.calls;
    const types = calls.map((call: any) => call[0].where.userId_type.type);
    expect(types).toContain('PERSONAL_WEBSITE');
    expect(types).toContain('INSTAGRAM');
    expect(types).not.toContain('TWITTER');
  });

  it('should not mark profile as completed when fullName is empty', async () => {
    const profileData = {
      fullName: 'James Martin',
      location: 'Philadelphia',
      bio: 'Analyst',
      profileIcon: 3,
    };

    mockReq.body = profileData;

    // Simulate missing fullName in returned user
    const mockUpdatedUser = {
      id: TEST_USER_ID,
      fullName: '', // Empty fullName
      location: profileData.location,
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
      contact: '+3333333333',
      isCompleted: false,
    };

    vi.spyOn(UserRepository, 'updateProfile').mockResolvedValue(mockUpdatedUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    // Should only call updateProfile once since profile is incomplete
    expect(UserRepository.updateProfile).toHaveBeenCalledTimes(1);
  });

  it('should not mark profile as completed when location is empty', async () => {
    const profileData = {
      fullName: 'Karen White',
      location: 'Nashville',
      bio: 'Manager',
      profileIcon: 2,
    };

    mockReq.body = profileData;

    // Simulate missing location in returned user
    const mockUpdatedUser = {
      id: TEST_USER_ID,
      fullName: profileData.fullName,
      location: '', // Empty location
      bio: profileData.bio,
      profileIcon: profileData.profileIcon,
      contact: '+4444444444',
      isCompleted: false,
    };

    vi.spyOn(UserRepository, 'updateProfile').mockResolvedValue(mockUpdatedUser as any);

    await updateUserProfileController(mockReq as Request, mockRes as Response, mockNext);

    // Should only call updateProfile once since profile is incomplete
    expect(UserRepository.updateProfile).toHaveBeenCalledTimes(1);
  });
});

describe('user controller - getUserPublicController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      params: { username: 'john_doe' },
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      locals: {},
    };

    mockNext = vi.fn();

    vi.spyOn(logger, 'info').mockImplementation(() => logger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return public profile when user exists', async () => {
    const mockUser = {
      id: 'user-1',
      username: 'john_doe',
      fullName: 'John Doe',
      bio: 'Developer',
    };

    vi.spyOn(UserRepository, 'findByUserName').mockResolvedValue(mockUser as any);

    await getUserPublicController(mockReq as Request, mockRes as Response, mockNext);

    expect(UserRepository.findByUserName).toHaveBeenCalledWith('john_doe');
    expect(mockRes.json).toHaveBeenCalled();

    const responseData = (mockRes.json as any).mock.calls[0][0];
    expect(responseData).toHaveProperty('data');
    expect(responseData.data).toEqual(
      expect.objectContaining({
        username: 'john_doe',
        fullName: 'John Doe',
      })
    );
  });

  it('should throw NotFoundError when user not found', async () => {
    vi.spyOn(UserRepository, 'findByUserName').mockResolvedValue(null as any);

    await getUserPublicController(mockReq as Request, mockRes as Response, mockNext);

    expect(UserRepository.findByUserName).toHaveBeenCalledWith('john_doe');
    expect(mockRes.json).not.toHaveBeenCalled();

    expect(mockNext).toHaveBeenCalled();
    const passedError = (mockNext as any).mock.calls[0][0];
    expect(passedError).toBeInstanceOf(NotFoundError);
    expect(passedError.message).toBe('User not found');
  });

  it('should log info message when retrieving user by username', async () => {
    const mockUser = {
      id: 'user-2',
      username: 'jane_smith',
      fullName: 'Jane Smith',
      bio: 'Product Manager',
    };

    vi.spyOn(UserRepository, 'findByUserName').mockResolvedValue(mockUser as any);

    await getUserPublicController(mockReq as Request, mockRes as Response, mockNext);

    // Verify logger was called with the expected message
    expect(logger.info).toHaveBeenCalledWith(
      'Getting user by username in getUserPublicController ...'
    );
    expect(mockRes.json).toHaveBeenCalled();
  });
});

describe('user controller - deleteUserController', () => {
  let mockReq: Partial<Request> & { userId?: string };
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      userId: TEST_USER_ID,
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
      locals: {},
    };

    mockNext = vi.fn();

    vi.spyOn(logger, 'info').mockImplementation(() => logger);
    vi.spyOn(logger, 'error').mockImplementation(() => logger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully delete user and clear cookies', async () => {
    const mockDeletedUser = {
      id: TEST_USER_ID,
      email: 'user@example.com',
      username: 'testuser',
      isDeleted: true,
    };

    vi.spyOn(UserRepository, 'delete').mockResolvedValue(mockDeletedUser as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    await deleteUserController(mockReq as Request, mockRes as Response, mockNext);

    expect(UserRepository.delete).toHaveBeenCalledWith(TEST_USER_ID);
    expect(mockRes.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(mockRes.json).toHaveBeenCalled();

    const responseData = (mockRes.json as any).mock.calls[0][0]; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(responseData).toHaveProperty('data');
    expect(responseData.data).toEqual(mockDeletedUser);
  });

  it('should throw BadRequestError when userId is missing', async () => {
    mockReq.userId = undefined;

    await deleteUserController(mockReq as Request, mockRes as Response, mockNext);

    expect(UserRepository.delete).not.toHaveBeenCalled();
    expect(mockRes.clearCookie).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();

    const passedError = (mockNext as any).mock.calls[0][0]; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(passedError).toBeInstanceOf(BadRequestError);
    expect(passedError.message).toBe('User ID is required');
  });

  it('should throw BadRequestError when userId is null', async () => {
    mockReq.userId = null as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    await deleteUserController(mockReq as Request, mockRes as Response, mockNext);

    expect(UserRepository.delete).not.toHaveBeenCalled();
    expect(mockRes.clearCookie).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();

    const passedError = (mockNext as any).mock.calls[0][0]; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(passedError).toBeInstanceOf(BadRequestError);
  });

  it('should throw BadRequestError when userId is empty string', async () => {
    mockReq.userId = '';

    await deleteUserController(mockReq as Request, mockRes as Response, mockNext);

    expect(UserRepository.delete).not.toHaveBeenCalled();
    expect(mockRes.clearCookie).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();

    const passedError = (mockNext as any).mock.calls[0][0]; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(passedError).toBeInstanceOf(BadRequestError);
  });

  it('should throw NotFoundError when user does not exist', async () => {
    vi.spyOn(UserRepository, 'delete').mockResolvedValue(null as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    await deleteUserController(mockReq as Request, mockRes as Response, mockNext);

    expect(UserRepository.delete).toHaveBeenCalledWith(TEST_USER_ID);
    expect(mockRes.clearCookie).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();

    const passedError = (mockNext as any).mock.calls[0][0]; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(passedError).toBeInstanceOf(NotFoundError);
    expect(passedError.message).toBe('User not found');
  });

  it('should clear both accessToken and refreshToken cookies', async () => {
    const mockDeletedUser = {
      id: TEST_USER_ID,
      email: 'test@example.com',
      isDeleted: true,
    };

    vi.spyOn(UserRepository, 'delete').mockResolvedValue(mockDeletedUser as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    await deleteUserController(mockReq as Request, mockRes as Response, mockNext);

    const clearCookieCalls = (mockRes.clearCookie as any).mock.calls; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(clearCookieCalls).toHaveLength(2);
    expect(clearCookieCalls[0][0]).toBe('accessToken');
    expect(clearCookieCalls[1][0]).toBe('refreshToken');
  });

  it('should send success response with correct message', async () => {
    const mockDeletedUser = {
      id: TEST_USER_ID,
      email: 'user@example.com',
      isDeleted: true,
    };

    vi.spyOn(UserRepository, 'delete').mockResolvedValue(mockDeletedUser as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    await deleteUserController(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalled();
    const responseData = (mockRes.json as any).mock.calls[0][0]; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(responseData.message).toBe('success');
    expect(responseData).toHaveProperty('data');
  });

  it('should not clear cookies when repository returns null', async () => {
    vi.spyOn(UserRepository, 'delete').mockResolvedValue(null as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    await deleteUserController(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.clearCookie).not.toHaveBeenCalled();
  });

  it('should handle different user IDs correctly', async () => {
    const userIds = ['user-id-001', 'user-id-002', 'another-test-user-123'];

    for (const userId of userIds) {
      mockReq.userId = userId;
      const mockDeletedUser = { id: userId, email: `user-${userId}@example.com`, isDeleted: true };

      vi.spyOn(UserRepository, 'delete').mockResolvedValue(mockDeletedUser as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      await deleteUserController(mockReq as Request, mockRes as Response, mockNext);

      expect(UserRepository.delete).toHaveBeenCalledWith(userId);
      vi.clearAllMocks();
    }
  });
});
