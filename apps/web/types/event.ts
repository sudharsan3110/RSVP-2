export interface IEvent {
  id: string;
  creatorId: number;
  name: string;
  slug: string;
  category: string;
  startTime: Date;
  endTime: Date;
  eventDate: Date;
  description: string;
  eventImageId: string;
  venueType: VenueType;
  venueAddress?: string;
  venueUrl?: string;
  hostPermissionRequired: boolean;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  numberOfAttendees?: number;
  host?: string;
  Cohost: ICohost[];
  creator: Creator;
}
export interface Creator {
  full_name: string;
}
export interface ICohost {
  user: {
    profile_icon: string;
    full_name: string;
  };
}

export interface IEventResponse {
  event: IEvent;
  totalAttendees: number;
}

export interface IEventCard {
  className?: string;
  event: IEvent | null;
  type?: 'manage';
}

export interface IEventHost {
  role: 'Creator' | 'Manager' | 'Celebrity' | 'ReadOnly';
  user: {
    id: string;
    full_name: string;
    profile_icon: string;
    primary_email: string;
  };
}

export type VenueType = 'physical' | 'virtual' | 'later';
