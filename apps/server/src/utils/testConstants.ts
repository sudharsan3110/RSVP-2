import { Role } from '@prisma/client';

export const HTTP_OK = 200;
export const HTTP_CREATED = 201;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_NOT_FOUND = 404;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_INTERNAL_SERVER_ERROR = 500;

export const TEST_USER_ID = 'test-user';

export const ENDPOINT_SLUG = '/slug';
export const ENDPOINT_POPULAR_EVENTS = '/popular';
export const ENDPOINT_FILTER_EVENTS = '/filter';
export const ENDPOINT_USER_EVENTS = '/user';
export const ENDPOINT_AUTH_ME = '/me';

export const FAKE_USER_ID2 = {
  id: 'test-user-2',
  email: 'user@example.com',
  full_name: 'User Example',
  username: 'userexample',
  is_completed: true,
  magicToken: 'secret-magic-token',
  refreshToken: 'secret-refresh-token',
};

export const FAKE_EVENT = {
  id: 'event-123',
  slug: 'annual-conference',
  name: 'Annual Conference',
  creator: {
    full_name: 'Team Shiksha',
    username: 'teamshiksha',
    profile_icon: null,
  },
  Cohost: [FAKE_USER_ID2.id],
};

export const FAKE_ATTENDEE_COUNT = 15;

export const FAKE_USER = {
  id: TEST_USER_ID,
  email: 'user@example.com',
  full_name: 'User Example',
  username: 'userexample',
  is_completed: true,
  magicToken: 'secret-magic-token',
  refreshToken: 'secret-refresh-token',
};

export const FAKE_HOST = {
  id: 'cohost-id',
  userId: FAKE_USER_ID2.id,
  eventId: FAKE_EVENT.id,
  role: 'MANAGER' as Role,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
