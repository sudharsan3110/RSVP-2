import { HostRole } from '@prisma/client';

export const HTTP_OK = 200;
export const HTTP_CREATED = 201;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_NOT_FOUND = 404;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_INTERNAL_SERVER_ERROR = 500;

export const TEST_USER_ID = 'test-user';

export const ENDPOINT_SLUG = '/slug';
export const ENDPOINT_POPULAR_EVENTS = '/popular';
export const ENDPOINT_FILTER_EVENTS = '/';
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
  role: 'MANAGER' as HostRole,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ATTENDEE TEST CONSTANTS

export const ATTENDEE_ID = 'attendee-1';
export const ATTENDEE_ID_2 = 'attendee-2';
export const USER_ID = 'user-1';
export const USER_ID_2 = 'user-2';
export const EVENT_ID = 'event-1';
export const QR_TOKEN = 'token-123';
export const INVALID_TOKEN = 'invalid-token';
export const NON_EXISTENT_ID = 'non-existent-id';
export const EVENT_NO_ATTENDEES = 'event-no-attendees';
export const STATE_ID = '1';
export const COUNTRY_ID = '1';

// Mock Attendee Objects
export const MOCK_ATTENDEE = {
  id: ATTENDEE_ID,
  userId: USER_ID,
  eventId: EVENT_ID,
  isDeleted: false,
  status: 'GOING' as const,
};

export const MOCK_ATTENDEE_WITH_USER = {
  id: ATTENDEE_ID,
  qrToken: QR_TOKEN,
  eventId: EVENT_ID,
  userId: USER_ID,
  isDeleted: false,
  user: {
    fullName: 'John Doe',
    primaryEmail: 'john@example.com',
    contact: '+1234567890',
    profileIcon: 'https://example.com/icon.jpg',
  },
};

export const MOCK_ATTENDEE_WITH_USER_NO_EVENT = {
  id: ATTENDEE_ID,
  qrToken: QR_TOKEN,
  eventId: EVENT_ID,
  userId: USER_ID,
  user: {
    fullName: 'Jane Smith',
    primaryEmail: 'jane@example.com',
    contact: '+9876543210',
    profileIcon: null,
  },
};

export const MOCK_MULTIPLE_ATTENDEES = [
  {
    id: ATTENDEE_ID,
    userId: USER_ID,
    eventId: EVENT_ID,
    isDeleted: false,
  },
  {
    id: ATTENDEE_ID_2,
    userId: USER_ID_2,
    eventId: EVENT_ID,
    isDeleted: false,
  },
];

export const MOCK_ATTENDEES_WITH_DETAILS = [
  {
    id: ATTENDEE_ID,
    userId: USER_ID,
    eventId: EVENT_ID,
    isDeleted: false,
    user: {
      fullName: 'John Doe',
      primaryEmail: 'john@example.com',
      contact: '+1234567890',
    },
  },
  {
    id: ATTENDEE_ID_2,
    userId: USER_ID_2,
    eventId: EVENT_ID,
    isDeleted: false,
    user: {
      fullName: 'Jane Smith',
      primaryEmail: 'jane@example.com',
      contact: '+9876543210',
    },
  },
];

export const MOCK_NEW_ATTENDEE_DATA = {
  userId: USER_ID,
  eventId: EVENT_ID,
  qrToken: QR_TOKEN,
};

export const MOCK_CREATED_ATTENDEE = {
  id: ATTENDEE_ID,
  ...MOCK_NEW_ATTENDEE_DATA,
  status: 'GOING' as const,
  isDeleted: false,
  allowedStatus: true,
};

export const MOCK_UPDATED_ATTENDEE = {
  id: ATTENDEE_ID,
  userId: USER_ID,
  eventId: EVENT_ID,
  status: 'CANCELLED' as const,
  isDeleted: false,
};

export const MOCK_ATTENDEE_GOING = {
  id: ATTENDEE_ID,
  userId: USER_ID,
  eventId: EVENT_ID,
  allowedStatus: true,
  status: 'GOING' as const,
  isDeleted: false,
};

export const MOCK_ATTENDEE_WAITING = {
  id: ATTENDEE_ID,
  userId: USER_ID,
  eventId: EVENT_ID,
  allowedStatus: false,
  status: 'WAITING' as const,
  isDeleted: false,
};

export const MOCK_ATTENDEE_CANCELLED = {
  id: ATTENDEE_ID,
  userId: USER_ID,
  eventId: EVENT_ID,
  status: 'CANCELLED' as const,
  isDeleted: true,
  allowedStatus: false,
};

export const MOCK_ATTENDEE_RESTORED = {
  id: ATTENDEE_ID,
  userId: USER_ID,
  eventId: EVENT_ID,
  status: 'GOING' as const,
  isDeleted: false,
  allowedStatus: true,
};

export const MOCK_UPDATE_MULTIPLE_RESULT = { count: 3 };

export const MOCK_EVENT_DATA = {
  id: EVENT_ID,
  name: 'Tech Meetup',
  startTime: new Date('2025-12-01'),
  endTime: new Date('2025-12-01'),
  category: { id: 'cat-1', name: 'Technology' },
};

export const ATTENDEE_COUNT_GOING = 5;

// Date constants for testing date filtering
export const START_DATE = new Date('2025-12-01');
export const END_DATE = new Date('2025-12-31');

export const DUMMY_CITIES = [
  {
    id: '1',
    name: 'dumb city',
    stateId: '11',
    countryId: '111',
  },
  {
    id: '2',
    name: 'dumb city 0',
    stateId: '12',
    countryId: '112',
  },
];
export const DUMMY_CITY = {
  id: '1',
  name: 'single dumb city',
  stateId: '11',
  countryId: '111',
};

export const MOCK_STATE = {
  id: '1',
  name: 'New York',
  country_id: '1',
};

export const MOCK_STATES = [
  { id: '1', name: 'New York', country_id: '1' },
  { id: '2', name: 'California', country_id: '1' },
];
