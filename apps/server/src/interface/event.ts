import { VenueType } from '@prisma/client';

export interface CreateEventDto {
  creatorId: string;
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
  userId?: string;
  search?: string;
  category?: string;
  fromDate: Date;
  toDate: Date;
  venueType?: string;
  status?: string;
}
