import { Attendee, AttendeeStatus } from '@/types/attendee';
import { Cohost, Role } from '@/types/cohost';
import { Event, VenueType } from '@/types/events';
import { User } from '@/types/user';
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

export const baseUser: User = new User({
  id: "1",
  primaryEmail: 'test@example.com',
  contact: '1234567890',
  eventParticipationEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isCompleted: true,
  profileIcon: 1,
  isDeleted: false,
  isProfileComplete: true,
  fullName: 'Test User',
  userName: 'testuser',
  initials: 'TU',
});

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

export const TEST_COHOSTS: Cohost[] = [
  new Cohost({
    role: Role.MANAGER,
    user: new User({
      id: '1',
      profileIcon: 1,
      fullName: 'John Doe',
      userName: 'johndoe',
    }),
  }),
  new Cohost({
    role: Role.MANAGER,
    user: new User({
      id: '2',
      profileIcon: 2,
      fullName: 'Jane Smith',
      userName: 'janesmith',
    }),
  }),
];

export const  TEST_EVENT: Event = new Event({
  id: 'event-123',
  creatorId: '1',
  name: 'Tech Conference 2024',
  slug: 'tech-conference-2024',
  description: 'A great tech conference',
  startTime: TEST_EVENT_DATES.startTime,
  endTime: TEST_EVENT_DATES.endTime,
  eventDate: TEST_EVENT_DATES.eventDate,
  category: 'Technology',
  eventImageUrl: '/images/tech-conf.jpg',
  venueType: VenueType.Physical,
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
  cohosts: TEST_COHOSTS,
});

export const TEST_EVENT_DATA = {
  event: TEST_EVENT,
  totalAttendees: 5,
};

export const TEST_USER_RECENT_REG: User = new User({
  id: "1",
  primaryEmail: 'test@example.com',
  fullName: 'Test User',
  profileIcon: 1,
  eventParticipationEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  contact: '1234567890',
});

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
    user: new User({ ...TEST_USER_RECENT_REG, id: '2', fullName: 'Another User' }),
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
