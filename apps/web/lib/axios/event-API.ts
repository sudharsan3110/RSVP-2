import { Event } from '@/types/Events';
import { Attendee } from '@/types/attendee';
import { IEvent, IEventHost, IEventResponse } from '@/types/event';
import { CommunicationForm } from '../zod/communication';
import { CreateEventSubmissionType } from '../zod/event';
import api from './instance';

export interface GetAttendeeByEventIdParams extends PaginationParams {
  eventId: string;
  hasAttended?: boolean;
  sortBy: string;
}
export type UpdateEventSubmissionType = CreateEventSubmissionType & { id: string };

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
      totalAttendees: res.data.totalAttendees as number,
      event: new Event(res.data.event),
    })),

  editEventSlug: async (payload: { eventId: string; slug: string }) =>
    api.patch(`/event/${payload.eventId}/slug`, payload),

  deleteEvent: async (eventId: string) => api.delete(`/event/${eventId}`),

  createEventCommunication: async (eventId: string, payload: CommunicationForm) =>
    api.post(`/event/${eventId}/communications`, payload),

  getEventCommunications: async (eventId: string) => {
    return api.get(`/event/${eventId}/communications`);
  },

  getEventAttendees: async (params: GetAttendeeByEventIdParams) => {
    return api.get(`/event/${params.eventId}/attendees`, {
      params: params,
    });
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

  getEvent: async (): Promise<IEvent[]> => {
    const response = await api.get('/event');
    return response.data.data;
  },

  softDeleteAttendee: async (eventId: string) => {
    return api.delete(`event/${eventId}/attendee`);
  },

  getAttendee: async (eventId: string) => {
    return api.get(`event/${eventId}/attendees/ticket`).then((res) => res.data as Attendee);
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
    return api
      .get(`/event/${eventId}/attendee/qr/${ticketCode}`)
      .then((res) => res.data as Attendee);
  },

  getAttendeeTicketDetail: async (eventId: string) => {
    return api.get(`event/${eventId}/attendees/ticket`).then((res) => res.data as Attendee);
  },

  getEventBySlug: async (slug: string): Promise<IEventResponse | undefined> => {
    const response = await api.get(`/event/slug/${slug}`);
    return response.data;
  },

  getEventsBySearchParams: async (
    searchParams: Record<string, string | undefined>
  ): Promise<IEvent[]> => {
    const queryString = new URLSearchParams(searchParams as Record<string, string>).toString();
    const url = queryString ? `/event/user?${queryString}` : `/event/user`;
    const response = await api.get(url, { params: searchParams });
    return response.data.data.events;
  },

  cancelEvent: async (eventId: string) => {
    const response = await api.delete(`/event/${eventId}/attendee`);
    return response.data;
  },

  checkAllowStatus: async (eventId: string, userId: string) => {
    return api.patch(`/event/${eventId}/attendee/${userId}/allowStatus`, {
      eventId,
      userId,
    });
  },

  updateAttendeeAllowStatus: async (eventId: string, userId: string, allowedStatus: boolean) => {
    return api.patch(`/event/${eventId}/attendee/allowStatus`, {
      eventId,
      userId,
      allowedStatus,
    });
  },

  getPopularEvents: async (limit?: number) => {
    const response = await api.get('/event/popular', {
      params: { limit },
    });
    return response.data.data;
  },

  /* Cohost API */
  getEventCohosts: async (eventId: string): Promise<IEventHost[]> => {
    const hosts = await api.get(`/cohosts/events/${eventId}`);
    return hosts.data.hosts;
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
  deleteEventCohost: async (eventId: string, cohostId: string) => {
    const response = await api.delete(`cohosts/events/${eventId}/${cohostId}`);
    return response.data;
  },
};
