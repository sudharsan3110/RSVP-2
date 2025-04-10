import { IUser } from '@/types/user';
import { IEvent, ICohost } from '@/types/event';

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
    user: {
      profile_icon: 'icon1',
      full_name: 'John Doe',
    },
  },
  {
    user: {
      profile_icon: 'icon2',
      full_name: 'Jane Smith',
    },
  },
];

export const TEST_EVENT: IEvent = {
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
  Cohost: TEST_COHOSTS,
  creator: {
    full_name: 'Event Creator',
  },
};

export const TEST_EVENT_DATA = {
  event: TEST_EVENT,
  totalAttendees: 5,
};
