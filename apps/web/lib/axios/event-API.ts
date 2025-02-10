import { IEvent, IEventResponse } from '@/types/event';
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

  getEventById: async (eventId: string) => api.get(`/event/${eventId}`),

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

  getAttendee: async ({ eventId, userId }: { eventId: string; userId: string }) => {
    return api.get(`event/${eventId}/attendees/${userId}`);
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
};
