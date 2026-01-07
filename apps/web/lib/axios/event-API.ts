import { Event } from '@/types/events';
import { Attendee, AttendeeStatus } from '@/types/attendee';
import { CommunicationForm } from '../zod/communication';
import { CreateEventSubmissionType } from '../zod/event';
import api from './instance';
import { Cohost } from '@/types/cohost';
import { CategoryType } from '@/types/category';

export interface GetAttendeeByEventIdParams extends PaginationParams {
  eventId: string;
  hasAttended?: boolean;
  sortBy: string;
  status?: AttendeeStatus[];
}
export type UpdateEventSubmissionType = CreateEventSubmissionType & { id: string };

export type PaginationMetadata = {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type EventParams = {
  page: number;
  status?: string;
  sort?: string;
  search?: string;
  limit?: number;
  location?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type InviteGuestsParams = {
  eventId: string;
  emails: string[];
};

export const eventAPI = {
  createEvent: async (payload: CreateEventSubmissionType) => {
    return api.post('/event', payload);
  },
  updateEvent: async (payload: UpdateEventSubmissionType) => {
    const { id, ...rest } = payload;
    return api.patch(`/event/${payload.id}`, rest);
  },

  getEventById: async (eventId: string) =>
    api.get(`/event/${eventId}`).then((res) => ({
      totalAttendees: res.data.data.totalAttendees as number,
      event: new Event(res.data.data.event),
    })),

  editEventSlug: async (payload: { eventId: string; slug: string }) =>
    api.patch(`/event/${payload.eventId}/slug`, payload),

  deleteEvent: async (eventId: string) => api.delete(`/event/${eventId}`),
  cancelEvent: async (eventId: string) => api.patch(`/event/${eventId}/cancel`),

  createEventCommunication: async (eventId: string, payload: CommunicationForm) =>
    api.post(`/event/${eventId}/communications`, payload),

  getEventCommunications: async (eventId: string) => {
    return api.get(`/event/${eventId}/communications`);
  },

  getEventAttendees: async (params: GetAttendeeByEventIdParams) => {
    const apiParams = {
      ...params,
      status: params.status ? params.status.join(',') : undefined,
    };
    return api.get(`/event/${params.eventId}/attendees`, {
      params: apiParams,
    });
  },

  inviteGuests: async ({ eventId, emails }: InviteGuestsParams) => {
    return api.post(`/event/${eventId}/invites`, { emails });
  },

  getEventAttendeeExcel: async (params: GetAttendeeByEventIdParams) => {
    return api.get(`/event/${params.eventId}/attendees/excel`, {
      params: params,
    });
  },

  getEventAttendeesExcel: async (params: GetAttendeeByEventIdParams) => {
    return api.get(`/event/${params.eventId}/attendees/excel`, {
      params: params,
      responseType: 'arraybuffer',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  },

  createAttendee: async (eventId: string) => {
    return api.post(`event/${eventId}/attendees`);
  },

  getEvent: async (
    params?: EventParams
  ): Promise<{ events: Event[]; metadata: PaginationMetadata }> => {
    const response = await api.get('/event', { params });
    const events = response.data.data.events.map((event: Event) => new Event(event));
    const metadata = response.data.data.metadata;
    return { events, metadata };
  },

  getMyEvents: async (
    params?: EventParams
  ): Promise<{ events: Event[]; metadata: PaginationMetadata }> => {
    const response = await api.get('/event/user', { params });
    const events = response.data.data.events.map((event: Event) => new Event(event));
    const metadata = response.data.data.metadata;
    return { events, metadata };
  },

  getUpcomingEvents: async (
    params?: EventParams
  ): Promise<{ events: Event[]; metadata: PaginationMetadata }> => {
    const response = await api.get('/event/upcoming', { params });
    const events = response.data.data.events.map((event: Event) => new Event(event));
    const metadata = response.data.data.metadata;
    return { events, metadata };
  },

  softDeleteAttendee: async (eventId: string) => {
    return api.delete(`event/${eventId}/attendee`);
  },

  getAttendee: async (eventId: string) => {
    return api.get(`event/${eventId}/attendees/ticket`).then((res) => new Attendee(res.data.data));
  },

  verifyAttendee: async (payload: { eventId: string; attendeeId: string }) => {
    return api.patch(`event/${payload.eventId}/attendee/${payload.attendeeId}/verify`, payload);
  },

  getAttendeeByTicketCode: async ({
    eventId,
    ticketCode,
  }: {
    ticketCode: string;
    eventId: string;
  }) => {
    return api.get(`/event/${eventId}/attendee/qr/${ticketCode}`).then((res) => res.data);
  },

  getAttendeeTicketDetail: async (eventId: string) => {
    return api.get(`event/${eventId}/attendees/ticket`).then((res) => res.data.data as Attendee);
  },

  getEventBySlug: async (
    slug: string
  ): Promise<{ event: Event; totalAttendees: number } | undefined> => {
    const response = await api.get(`/event/slug/${slug}`);
    return {
      event: new Event(response.data.data.event),
      totalAttendees: response.data.data.totalAttendees,
    };
  },

  cancelEventAttendee: async (eventId: string) => {
    const response = await api.delete(`/event/${eventId}/attendee`);
    return response.data;
  },

  updateAttendeeStatus: async (eventId: string, attendeeId: string, allowedStatus: boolean) => {
    return api.patch(`/event/${eventId}/attendee/${attendeeId}/status`, {
      allowedStatus,
    });
  },

  getPopularEvents: async (limit?: number): Promise<Event[]> => {
    const response = await api.get('/event/popular', {
      params: { limit },
    });
    return response.data.data.map((event: Event) => new Event(event));
  },

  getEventImageSignedUrl: async (filename: string): Promise<string> => {
    const { data } = await api.get('/event/upload-image', { params: { filename } });
    return data.data.signedUrl as string;
  },

  /* Cohost API */
  getEventCohosts: async (eventId: string): Promise<Cohost[]> => {
    const { data } = await api.get(`/cohosts/events/${eventId}`);
    return data.data.map((host: Cohost) => new Cohost(host));
  },

  createEventCohost: async (eventId: string, payload: { cohostEmail: string; role: string }) => {
    const { cohostEmail, role } = payload;
    const response = await api.post(`cohosts/`, {
      email: cohostEmail,
      role: role,
      eventId: eventId,
    });
    return response.data;
  },
  deleteEventCohost: async (eventId: string, userId: string) => {
    const response = await api.delete(`cohosts/events/${eventId}/${userId}`);
    return response.data;
  },

  /* Category API to fetch all category list */
  getCategoryList: async () => {
    const response = await api.get('/categories');
    return response.data.data.map((category: CategoryType) => {
      return { value: category.id, label: category.name };
    });
  },
};
