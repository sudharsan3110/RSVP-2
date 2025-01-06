import { IEventResponse } from '@/types/event';
import { CreateEventSubmissionType } from '../zod/event';
import { CommunicationForm } from '../zod/communication';
import api from './instance';

export const eventAPI = {
  createEvent: async (payload: CreateEventSubmissionType) => {
    return api.post('/event', payload);
  },

  createEventCommunication: async (eventId: string, payload: CommunicationForm) => {
    return api.post(`/event/${eventId}/communications`, payload);
  },

  getEventCommunications: async (eventId: string) => {
    return api.get(`/event/${eventId}/communications`);
  },

  createAttendee: async (eventId: string) => {
    return api.post(`event/${eventId}/attendees`);
  },

  getEventBySlug: async (slug: string): Promise<IEventResponse> => {
    const response = await api.get(`/event/slug/${slug}`);
    return response.data;
  },

  getEventsBySearchParams: async (searchParams: Record<string, string | undefined>): Promise<IEvent[]> => {
    const queryString = new URLSearchParams(searchParams as Record<string, string>).toString();
    const url = queryString ? `/event/user?${queryString}` : `/event/user`;
    const response = await api.get(url);
    return response.data.data.events;
  },  
};
