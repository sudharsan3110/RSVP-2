import { VenueType } from '@prisma/client';

export interface CreateEventDto {
  creatorId: number;
  name: string;
  slug: string;
  category?: string;
  startTime: Date;
  endTime: Date;
  eventDate: Date;
  description?: string;
  eventImageId?: string;
  venueType: VenueType;
  venueAddress?: string;
  venueUrl?: string;
  hostPermissionRequired: boolean;
  capacity?: number;
  isActive?: boolean;
}

export interface IEventFilters {
  email: string;
  type: string;
  fromDate: Date;
  toDate: Date;
  search?: string;
}
