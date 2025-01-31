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
  className?: PropsWithClassName;
  event: IEvent | null;
}

export type VenueType = 'physical' | 'virtual' | 'later';
