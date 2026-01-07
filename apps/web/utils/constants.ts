export const userAvatarOptions = [
  { id: 1, src: '/images/user-avatar-afro-female.svg' },
  { id: 2, src: '/images/user-avatar-bald-beard.svg' },
  { id: 3, src: '/images/user-avatar-curly-hair-beard.svg' },
  { id: 4, src: '/images/user-avatar-short-hair-beard.svg' },
];

export const MAX_INVITE_EMAILS = 20;

export const EMAIL_IMAGE_FILES: EmailAttachmentOptions[] = [
  {
    filename: 'logo',
    path: 'public/images/logo.png',
    cid: 'logo.png',
  },
  {
    filename: 'verification-email',
    path: 'public/images/verification-email.png',
    cid: 'verification-email.png',
  },
];

export const evenTimeOptions: FormSelectOption[] = [
  { value: '00:00', label: '12:00 AM' },
  { value: '00:30', label: '12:30 AM' },
  { value: '01:00', label: '1:00 AM' },
  { value: '01:30', label: '1:30 AM' },
  { value: '02:00', label: '2:00 AM' },
  { value: '02:30', label: '2:30 AM' },
  { value: '03:00', label: '3:00 AM' },
  { value: '03:30', label: '3:30 AM' },
  { value: '04:00', label: '4:00 AM' },
  { value: '04:30', label: '4:30 AM' },
  { value: '05:00', label: '5:00 AM' },
  { value: '05:30', label: '5:30 AM' },
  { value: '06:00', label: '6:00 AM' },
  { value: '06:30', label: '6:30 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '07:30', label: '7:30 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '08:30', label: '8:30 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '09:30', label: '9:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '15:30', label: '3:30 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '16:30', label: '4:30 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '17:30', label: '5:30 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '18:30', label: '6:30 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '19:30', label: '7:30 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '20:30', label: '8:30 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '21:30', label: '9:30 PM' },
  { value: '22:00', label: '10:00 PM' },
  { value: '22:30', label: '10:30 PM' },
  { value: '23:00', label: '11:00 PM' },
  { value: '23:30', label: '11:30 PM' },
];

export const eventCategoryOptions: FormSelectOption[] = [
  { value: 'meetup', label: 'Meetup' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'sports', label: 'Sports' },
  { value: 'networking', label: 'Networking' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'charity', label: 'Charity' },
  { value: 'art', label: 'Art & Culture' },
  { value: 'education', label: 'Education' },
  { value: 'others', label: 'Others...' },
];

export const capacityOptions: FormCapacityOption[] = [
  { value: 20, label: '20' },
  { value: 40, label: '40' },
  { value: 80, label: '80' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
  { value: 0, label: 'Custom', isOthers: true },
];

export const eventCategoryColors = {
  all: 'bg-[#F2F2F2]',
  entertainment: 'bg-[#F2F2F2]',
  meetup: 'bg-[#EDE9FF]',
  hangout: 'bg-[#FFF5D7]',
  birthday: 'bg-[#FFECEC]',
  concert: 'bg-[#E4FFEA]',
  conference: 'bg-[#E0F7FF]',
  workshop: 'bg-[#FFE6FB]',
  party: 'bg-[#FFD6D6]',
  sports: 'bg-[#D6FFEE]',
  networking: 'bg-[#D6E4FF]',
  exhibition: 'bg-[#F0E6FF]',
  festival: 'bg-[#FFF0D6]',
  charity: 'bg-[#FFE0E0]',
  food: 'bg-[#DAFFD6]',
  'art & culture': 'bg-[#D6FEFF]',
  education: 'bg-[#E6EAFF]',
  gaming: 'bg-[#FFECD6]',
  'others...': 'bg-[#F2F2F2]',
};

export const NO_PLANNED_EVENTS_TITLE = 'No Upcoming Events';
export const NO_PAST_EVENTS_TITLE = 'No Past Events';
export const NO_PLANNED_EVENTS_MESSAGE =
  'You’re not attending any events yet. Click Below to navigate to discover events around you!.';

export const NO_EVENT_TITLE = 'No Events Planned';
export const NO_EVENTS_MESSAGE = 'You have no events planned yet. Why not host one?';
export const locationName = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'delhi',
    label: 'Delhi',
  },
  {
    value: 'mumbai',
    label: 'Mumbai',
  },
  {
    value: 'bangalore',
    label: 'Bangalore',
  },
];

export const VERCEL_AVATAR_BASE_URL = `https://avatar.vercel.sh`;

export const FORM_CACHE_KEY = 'EVENTFORM';
export const EXPIRY_MINUTES = 20;
export const INVALID_DATE = 'Invalid Date Format';
export const EVENTS_QUERY_KEY = 'events';
export const EVENT_COHOST_KEY = 'cohost';
export const ATTENDEE_QUERY_KEY = 'attendees';
export const EVENT_CATEGORY_LIST_KEY = 'category-list';
