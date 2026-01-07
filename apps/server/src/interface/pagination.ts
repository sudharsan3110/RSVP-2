/**
 * Interface for pagination parameters.
 * Used to define the structure of pagination-related inputs.
 */
import { Host, Event, Attendee, User } from '@prisma/client';
export interface IPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface for the result of a paginated query.
 * Used to define the structure of paginated data and metadata.
 */
export interface IPaginatedResult<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}
export type HostWithEventAndAttendees = Host & {
  event: Event & {
    attendees: Attendee[];
    creator: User;
    _count: { attendees: number };
  };
  user: User;
};
