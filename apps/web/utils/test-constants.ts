import { IUser } from '@/types/user';
import { IEvent, ICohost } from '@/types/event';
import { Attendee, AttendeeStatus } from '@/types/attendee';
import { Event } from '@/types/Events';
export const PHONE_NUMBER_LABEL = /phone number/i;
export const SAVE_BUTTON_LABEL = /save/i;
export const RESET_BUTTON_LABEL = /reset/i;

export const TEST_COMPONENT = {
  PHONE_NUMBER_FORM: 'PhoneNumberForm',
};

export const invalidPhoneNumberFormats = [
  { input: '987654321', error: 'Phone number must be 10 digits' },
  { input: '98765432101', error: 'Phone number must be 10 digits' },
  { input: '98 76543210', error: 'Only numbers are allowed' },
  { input: '+919876543210', error: 'Only numbers are allowed' },
  { input: 'abcdefghij', error: 'Only numbers are allowed' },
];

export const baseUser: IUser = {
  id: 1,
  primary_email: 'test@example.com',
  contact: '1234567890',
  event_participation_enabled: true,
  created_at: new Date(),
  updated_at: new Date(),
};

export const invalidEmailFormats = [
  'plainaddress',
  '@missingusername.com',
  'username@.com',
  'username@com',
  'username@domain..com',
];

export const TEST_EVENT_DATES = {
  startTime: new Date('2024-04-15T10:00:00Z'),
  endTime: new Date('2024-04-15T18:00:00Z'),
  eventDate: new Date('2024-04-15'),
};

export const TEST_COHOSTS: ICohost[] = [
  {
    role: 'Manager',
    user: {
      id: '1',
      profile_icon: 'icon1',
      full_name: 'John Doe',
      username: 'johndoe',
    },
  },
  {
    role: 'Manager',
    user: {
      id: '2',
      profile_icon: 'icon2',
      full_name: 'Jane Smith',
      username: 'janesmith',
    },
  },
];

export const  TEST_EVENT: IEvent = {
  id: 'event-123',
  creatorId: '1',
  name: 'Tech Conference 2024',
  slug: 'tech-conference-2024',
  description: 'A great tech conference',
  startTime: TEST_EVENT_DATES.startTime,
  endTime: TEST_EVENT_DATES.endTime,
  eventDate: TEST_EVENT_DATES.eventDate,
  category: 'Technology',
  eventImageId: '/images/tech-conf.jpg',
  venueType: 'physical',
  venueAddress: 'Tech Hub',
  hostPermissionRequired: true,
  capacity: 100,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  creator: {
    id: '1',
    full_name: 'Event Creator',
    username: 'eventcreator',
    profile_icon: 'creator-icon',
  },
  Cohost: TEST_COHOSTS.map((cohost) => ({
    role: 'Manager',
    user: {
      ...cohost.user,
      username: cohost.user.full_name.toLowerCase().replace(' ', ''),
    },
  })),
};

export const TEST_EVENT_DATA = {
  event: TEST_EVENT,
  totalAttendees: 5,
};

export const TEST_USER_RECENT_REG: IUser = {
  id: 1,
  primary_email: 'test@example.com',
  full_name: 'Test User',
  profile_icon: '1',
  event_participation_enabled: true,
  created_at: new Date(),
  updated_at: new Date(),
  contact: '1234567890',
};

export const TEST_ATTENDEES_RECENT_REG = [
  new Attendee({
    id: 'attendee1',
    userId: 'user1',
    eventId: TEST_EVENT.id,
    registrationTime: new Date(),
    status: AttendeeStatus.Going,
    user: TEST_USER_RECENT_REG,
    hasAttended: false,
    checkInTime: null,
    feedback: null,
    qrToken: 'token1',
    allowedStatus: true,
    deleted: false,
    updatedAt: new Date(),
    event: new Event(TEST_EVENT),
    isActive: true,
  }),
  new Attendee({
    id: 'attendee2',
    userId: 'user2',
    eventId: TEST_EVENT.id,
    registrationTime: new Date(),
    status: AttendeeStatus.Waiting,
    user: { ...TEST_USER_RECENT_REG, id: 2, full_name: 'Another User' },
    hasAttended: false,
    checkInTime: null,
    feedback: null,
    qrToken: 'token2',
    allowedStatus: true,
    deleted: false,
    updatedAt: new Date(),
    event: new Event(TEST_EVENT),
    isActive: true,
  }),
];
