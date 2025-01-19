import { IEvent, IEventResponse } from '@/types/event';
import { CreateEventSubmissionType } from '../zod/event';
import { CommunicationForm } from '../zod/communication';
import api from './instance';

export const eventAPI = {
  createEvent: async (payload: CreateEventSubmissionType) => {
    return api.post('/event', payload);
  },

  getEventById: async (eventId: string) => api.get(`/event/${eventId}`),

  createEventCommunication: async (eventId: string, payload: CommunicationForm) =>
    api.post(`/event/${eventId}/communications`, payload),

  getEventCommunications: async (eventId: string) => {
    return api.get(`/event/${eventId}/communications`);
  },

  createAttendee: async (eventId: string) => {
    return api.post(`event/${eventId}/attendees`);
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
};
