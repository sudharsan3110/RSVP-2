import { VenueType } from '@prisma/client';

/**
 * Interface for filtering and paginating events.
 */

export interface IAllowStatus {
  attendeeId: string;
  allowedStatus: boolean;
}

/**
 * Interface for creating a new event.
 */
export interface ICreateEvent {
  creatorId: string;
  name: string;
  slug: string;
  category?: string;
  startTime: Date;
  endTime: Date;
  eventDate: Date;
  description?: string;
  eventImageUrl?: string;
  venueType: VenueType;
  venueAddress?: string;
  venueUrl?: string;
  hostPermissionRequired: boolean;
  capacity?: number;
  isActive?: boolean;
}

/**
 * Interface for filtering events based on various criteria.
 */
export interface IEventFilters {
  userId?: string;
  search?: string;
  category?: string;
  fromDate?: Date;
  toDate?: Date;
  venueType?: string;
  status?: string;
}
