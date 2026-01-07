import { VenueType } from '@prisma/client';

/**
 * Structure for a successful invite or restore entry.
 */
export interface IInviteSuccessEntry {
  email: string;
}

/**
 * Structure for a failed invite entry.
 */
export interface IInviteFailedEntry {
  email: string;
  error: string;
}

/**
 * Structure for a skipped invite entry with a reason.
 */
export interface IInviteSkippedEntry {
  email: string;
  reason: string;
}

/**
 * Response structure for the invite attendees controller.
 */
export interface IInviteResults {
  invited: IInviteSuccessEntry[];
  restored: IInviteSuccessEntry[];
  failed: IInviteFailedEntry[];
  skipped: IInviteSkippedEntry[];
}

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
  categoryId?: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  eventImageUrl?: string;
  venueType: VenueType;
  venueAddress?: string;
  venueUrl?: string;
  hostPermissionRequired: boolean;
  capacity?: number;
  isActive?: boolean;
  discoverable?: boolean;
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
