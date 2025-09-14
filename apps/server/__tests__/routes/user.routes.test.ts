import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';

import { UserRepository as Users } from '@/repositories/user.repository';
import { userRouter } from '@/routes/v1/users.routes';
import {
  FAKE_USER,
  TEST_USER_ID,
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_UNAUTHORIZED,
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
} from '@/utils/testConstants';
import logger from '@/utils/logger';

let userExists: boolean = true;

vi.mock('@/middleware/authMiddleware', () => {
  return {
    default: (req: Request, res: Response, next: NextFunction) => {
      if (!userExists) {
        return res.status(HTTP_NOT_FOUND).json({ message: 'User not found' });
      }
      (req as any).userId = TEST_USER_ID;
      next();
    },
  };
});

vi.mock('@/middleware/validate', () => {
  return {
    validate: () => (req: Request, res: Response, next: NextFunction) => {
      if (req.body.secondary_email && !req.body.secondary_email.includes('@')) {
        return res.status(400).json({
          message: 'Invalid email format',
          errors: [{ path: 'secondary_email', message: 'Invalid email format' }],
        });
      }

      if (req.body.contact && req.body.contact.length > 10) {
        return res.status(400).json({
          message: 'Contact number must not exceed 10 characters',
          errors: [{ path: 'contact', message: 'Contact number must not exceed 10 characters' }],
        });
      }

      if (
        req.body.hasOwnProperty('full_name') &&
        (!req.body.full_name || req.body.full_name.trim() === '')
      ) {
        return res.status(400).json({
          message: 'Full name is required',
          errors: [{ path: 'full_name', message: 'Full name is required' }],
        });
      }

      const longFields = ['twitter', 'instagram', 'website'];
      for (const field of longFields) {
        if (req.body[field] && req.body[field].length > 50) {
          return res.status(HTTP_BAD_REQUEST).json({
            message: `${field} must not exceed 50 characters`,
            errors: [{ path: field, message: `${field} must not exceed 50 characters` }],
          });
        }
      }

      if (req.body.bio && req.body.bio.length > 500) {
        return res.status(HTTP_BAD_REQUEST).json({
          message: 'bio must not exceed 500 characters',
          errors: [{ path: 'bio', message: 'bio must not exceed 500 characters' }],
        });
      }

      const protectedFields = ['id', 'primary_email', 'magicToken', 'refreshToken'];
      for (const field of protectedFields) {
        if (req.body[field] !== undefined) {
          return res.status(HTTP_BAD_REQUEST).json({
            message: `Cannot update ${field}`,
            errors: [{ path: field, message: `Cannot update ${field}` }],
          });
        }
      }
      next();
    },
  };
});

vi.mock('@/middleware/apiLimiter', () => {
  return {
    default: (_req: Request, _res: Response, next: NextFunction) => {
      next();
    },
  };
});

const app = express();
app.use(express.json());
app.use('/users', userRouter);

beforeEach(() => {
  vi.resetAllMocks();
  userExists = true;
});

describe('User Router Endpoints', () => {
  describe(`GET /users/:username (findByUserName)`, () => {
    const mockUser = {
      id: 'user-123',
      userName: 'johndoe',
      fullName: 'John Doe',
      bio: 'Software Developer',
      location: 'New York',
      socialLinks: [
        { type: 'INSTAGRAM', handle: 'johndoe' },
        { type: 'PERSONAL_WEBSITE', handle: 'johndoe.com' },
      ],
    };
    const USERNAME_ENDPOINT = '/user/johndoe';
    it('should return user details when a valid username is provided', async () => {
      vi.spyOn(Users as any, 'findByUserName').mockResolvedValue(mockUser);
      const res = await request(app).get(USERNAME_ENDPOINT);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('username', mockUser);
    });

    it('should return 404 when user is not found', async () => {
      vi.spyOn(Users as any, 'findByUserName').mockResolvedValue(null);
      const res = await request(app).get(`/user/nonexistentuser`);
      expect(res.status).toBe(HTTP_NOT_FOUND);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return user details without authentication (as a public route)', async () => {
      const appNoAuth = express();
      appNoAuth.use(express.json());

      appNoAuth.use((_req: Request, res: Response, _next: NextFunction) => {
        return res.status(HTTP_UNAUTHORIZED).json({ message: 'Invalid or expired token' });
      });
      appNoAuth.use('/users', userRouter);
      vi.spyOn(Users as any, 'findByUserName').mockResolvedValue(mockUser);

      const res = await request(appNoAuth).get(USERNAME_ENDPOINT);

      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('username', mockUser);
    });

    it('should return 500 when database error occurs', async () => {
      vi.spyOn(Users as any, 'findByUserName').mockRejectedValue(new Error('Database error'));

      const res = await request(app).get(USERNAME_ENDPOINT);

      expect(res.status).toBe(HTTP_INTERNAL_SERVER_ERROR);
      expect(res.body).toHaveProperty('message', 'Internal server error');
    });
  });

  describe('POST /users/profile', () => {
    const ENDPOINT_UPDATE_PROFILE = '/users/profile';

    it('should successfully update the user profile with valid full_name, location, and contact', async () => {
      const mockUpdatedUser = {
        ...FAKE_USER,
        full_name: 'John Doe',
        location: 'New York',
        contact: '1234567890',
      };

      const updateUserSpy = vi
        .spyOn(Users, 'updateProfile')
        .mockResolvedValue(mockUpdatedUser as any);

      const res = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        full_name: 'John Doe',
        location: 'New York',
        contact: '1234567890',
      });

      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'success');
      expect(updateUserSpy).toHaveBeenCalledTimes(1);
      expect(updateUserSpy).toHaveBeenCalledWith(TEST_USER_ID, {
        full_name: 'John Doe',
        location: 'New York',
        contact: '1234567890',
      });
      expect(res.body.data).toMatchObject({
        full_name: 'John Doe',
        location: 'New York',
        contact: '1234567890',
      });
    });

    it('should allow updating bio, twitter, instagram, and website with valid data', async () => {
      const mockUpdatedUser = {
        ...FAKE_USER,
        bio: 'SDE',
        twitter: 'https://twitter.com/test-user',
        instagram: 'https://www.instagram.com/test-user',
        website: 'https://www.test-user.com',
      };

      const updateUserSpy = vi
        .spyOn(Users, 'updateProfile')
        .mockResolvedValue(mockUpdatedUser as any);

      const res = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        bio: 'SDE',
        twitter: 'https://twitter.com/test-user',
        instagram: 'https://www.instagram.com/test-user',
        website: 'https://www.test-user.com',
      });

      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'success');
      expect(updateUserSpy).toHaveBeenCalledTimes(1);
      expect(updateUserSpy).toHaveBeenCalledWith(TEST_USER_ID, {
        bio: 'SDE',
        twitter: 'https://twitter.com/test-user',
        instagram: 'https://www.instagram.com/test-user',
        website: 'https://www.test-user.com',
      });
      expect(res.body.data).toMatchObject({
        bio: 'SDE',
        twitter: 'https://twitter.com/test-user',
        instagram: 'https://www.instagram.com/test-user',
        website: 'https://www.test-user.com',
      });
    });

    it('should allow updating secondary_email with a new valid email', async () => {
      const mockUpdatedUser = {
        ...FAKE_USER,
        secondary_email: 'test-user@example.com',
      };

      const updateUserSpy = vi
        .spyOn(Users, 'updateProfile')
        .mockResolvedValue(mockUpdatedUser as any);

      const res = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        secondary_email: 'test-user@example.com',
      });

      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'success');
      expect(updateUserSpy).toHaveBeenCalledTimes(1);
      expect(updateUserSpy).toHaveBeenCalledWith(TEST_USER_ID, {
        secondary_email: 'test-user@example.com',
      });
      expect(res.body.data.secondary_email).toBe('test-user@example.com');
    });

    it('should allow updating profile_icon with a valid string', async () => {
      const mockUpdatedUser = {
        ...FAKE_USER,
        profile_icon: '2',
      };

      const updateUserSpy = vi
        .spyOn(Users, 'updateProfile')
        .mockResolvedValue(mockUpdatedUser as any);

      const res = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        profile_icon: '2',
      });

      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'success');
      expect(updateUserSpy).toHaveBeenCalledTimes(1);
      expect(updateUserSpy).toHaveBeenCalledWith(TEST_USER_ID, {
        profile_icon: '2',
      });
      expect(res.body.data.profile_icon).toBe('2');
    });

    it('should correctly set is_completed to true when full_name, location, and contact are provided', async () => {
      const mockUpdatedUser = {
        ...FAKE_USER,
        full_name: 'John Doe',
        location: 'New York',
        contact: '1234567890',
        is_completed: true,
      };

      const updateUserSpy = vi
        .spyOn(Users, 'updateProfile')
        .mockResolvedValue(mockUpdatedUser as any);

      const res = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        full_name: 'John Doe',
        location: 'New York',
        contact: '1234567890',
      });

      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'success');
      expect(updateUserSpy).toHaveBeenCalledTimes(1);
      expect(updateUserSpy).toHaveBeenCalledWith(TEST_USER_ID, {
        full_name: 'John Doe',
        location: 'New York',
        contact: '1234567890',
      });
      expect(res.body.data.is_completed).toBe(true);
    });

    it('should return an error if secondary_email is not a valid email', async () => {
      const res = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        secondary_email: 'invalid-email',
      });
      expect(res.status).toBe(HTTP_BAD_REQUEST);
      expect(res.body).toHaveProperty('message', 'Invalid email format');
    });

    it('should return an error if contact exceeds 10 characters', async () => {
      const res = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        contact: '12345678901',
      });

      expect(res.status).toBe(HTTP_BAD_REQUEST);
      expect(res.body).toHaveProperty('message', 'Contact number must not exceed 10 characters');
    });

    it('should return an error if full_name is empty', async () => {
      const res = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        full_name: '',
      });

      expect(res.status).toBe(HTTP_BAD_REQUEST);
      expect(res.body).toHaveProperty('message', 'Full name is required');
    });

    it('should return 401 Unauthorized if the request is made without a valid token', async () => {
      const appNoAuth = express();
      appNoAuth.use(express.json());

      appNoAuth.use((_req: Request, res: Response, _next: NextFunction) => {
        return res.status(HTTP_UNAUTHORIZED).json({ message: 'Invalid or expired token' });
      });

      appNoAuth.use('/users', userRouter);

      const res = await request(appNoAuth).post(ENDPOINT_UPDATE_PROFILE).send({
        full_name: 'John Doe',
        location: 'New York',
        contact: '1234567890',
      });

      expect(res.status).toBe(HTTP_UNAUTHORIZED);
      expect(res.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('should return 401 Unauthorized if the token is expired', async () => {
      const appExpiredToken = express();
      appExpiredToken.use(express.json());

      appExpiredToken.use((_req: Request, res: Response, _next: NextFunction) => {
        return res.status(HTTP_UNAUTHORIZED).json({ message: 'Invalid or expired token' });
      });

      appExpiredToken.use('/users', userRouter);

      const res = await request(appExpiredToken).post(ENDPOINT_UPDATE_PROFILE).send({
        full_name: 'John Doe',
        location: 'New York',
        contact: '1234567890',
      });

      expect(res.status).toBe(HTTP_UNAUTHORIZED);
      expect(res.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('should return HTTP_BAD_REQUEST if twitter exceeds 51 characters', async () => {
      const longString = 'a'.repeat(51);
      const longBio = 'a'.repeat(501);
      const twitterResponse = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        twitter: longString,
      });
      const instagramResponse = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        instagram: longString,
      });
      const websiteResponse = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        website: longString,
      });
      const bioResponse = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        bio: longBio,
      });

      expect(twitterResponse.status).toBe(HTTP_BAD_REQUEST);
      expect(twitterResponse.body).toHaveProperty(
        'message',
        'twitter must not exceed 50 characters'
      );
      expect(instagramResponse.status).toBe(HTTP_BAD_REQUEST);
      expect(instagramResponse.body).toHaveProperty(
        'message',
        'instagram must not exceed 50 characters'
      );
      expect(websiteResponse.status).toBe(HTTP_BAD_REQUEST);
      expect(websiteResponse.body).toHaveProperty(
        'message',
        'website must not exceed 50 characters'
      );
      expect(bioResponse.status).toBe(HTTP_BAD_REQUEST);
      expect(bioResponse.body).toHaveProperty('message', 'bio must not exceed 500 characters');
    });

    it('should reset is_completed=true when full_name, location, and contact are missing', async () => {
      const mockUpdatedUser = {
        ...FAKE_USER,
        full_name: 'John Doe',
        contact: '1234567890',
        is_completed: false,
      };

      const updateUserSpy = vi
        .spyOn(Users, 'updateProfile')
        .mockResolvedValue(mockUpdatedUser as any);

      const res = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        full_name: 'John Doe',
        contact: '1234567890',
      });

      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'success');
      expect(updateUserSpy).toHaveBeenCalledTimes(1);
      expect(updateUserSpy).toHaveBeenCalledWith(TEST_USER_ID, {
        full_name: 'John Doe',
        contact: '1234567890',
      });
      expect(res.body.data.is_completed).toBe(false);
    });

    it('should not allow updating id, primary_email, magicToken or refreshToken', async () => {
      const updateIdResponse = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        id: 'new-id',
      });
      const updatePrimaryEmailResponse = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        primary_email: 'new-email@example.com',
      });
      const updateMagicTokenResponse = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        magicToken: 'new-magic-token',
      });
      const updateRefreshTokenResponse = await request(app).post(ENDPOINT_UPDATE_PROFILE).send({
        refreshToken: 'new-refresh-token',
      });
      expect(updateIdResponse.status).toBe(HTTP_BAD_REQUEST);
      expect(updateIdResponse.body).toHaveProperty('message', 'Cannot update id');
      expect(updatePrimaryEmailResponse.status).toBe(HTTP_BAD_REQUEST);
      expect(updatePrimaryEmailResponse.body).toHaveProperty(
        'message',
        'Cannot update primary_email'
      );
      expect(updateMagicTokenResponse.status).toBe(HTTP_BAD_REQUEST);
      expect(updateMagicTokenResponse.body).toHaveProperty('message', 'Cannot update magicToken');
      expect(updateRefreshTokenResponse.status).toBe(HTTP_BAD_REQUEST);
      expect(updateRefreshTokenResponse.body).toHaveProperty(
        'message',
        'Cannot update refreshToken'
      );
    });
  });

  describe('DELETE /users/:userId', () => {
    const ENDPOINT_DELETE_USER = `/users/${TEST_USER_ID}`;

    it('should soft delete a user successfully', async () => {
      vi.spyOn(Users, 'findById').mockResolvedValue(FAKE_USER as any);
      const softDeleteSpy = vi.spyOn(Users, 'delete').mockResolvedValue(FAKE_USER as any);

      const res = await request(app).delete(ENDPOINT_DELETE_USER);
      expect(res.status).toBe(HTTP_OK);
      expect(res.body).toHaveProperty('message', 'success');

      expect(softDeleteSpy).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('should return 404 if user is not found', async () => {
      userExists = false;

      const softDeleteSpy = vi.spyOn(Users, 'delete').mockResolvedValue(null as any);

      const res = await request(app).delete(ENDPOINT_DELETE_USER);
      expect(res.status).toBe(HTTP_NOT_FOUND);
      expect(res.body).toHaveProperty('message', 'User not found');

      expect(softDeleteSpy).not.toHaveBeenCalled();
    });

    it('should return 400 if userId is missing from the path', async () => {
      const res = await request(app).delete('/users/');

      expect(res.status).toBe(404);
    });

    it('should return 401 if the user is not authenticated', async () => {
      const appNoAuth = express();
      appNoAuth.use(express.json());

      appNoAuth.use((_req: Request, res: Response, _next: NextFunction) => {
        return res.status(HTTP_UNAUTHORIZED).json({ message: 'Invalid or expired token' });
      });

      appNoAuth.use('/users', userRouter);

      const resNoAuth = await request(appNoAuth).delete(ENDPOINT_DELETE_USER);

      expect(resNoAuth.status).toBe(HTTP_UNAUTHORIZED);
      expect(resNoAuth.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('should handle database errors during soft delete', async () => {
      vi.spyOn(Users, 'findById').mockResolvedValue(FAKE_USER as any);
      vi.spyOn(Users, 'delete').mockRejectedValue(new Error('Database error'));

      const errorHandler = vi.fn();
      app.use((err: Error, _req: any, _res: any, _next: any) => {
        errorHandler(err.message);
        _res.status(500).json({ message: 'Internal server error' });
      });

      const res = await request(app).delete(ENDPOINT_DELETE_USER);

      expect(res.status).toBe(500);
      expect(errorHandler).toHaveBeenCalledWith('Database error');
    });
  });
});
