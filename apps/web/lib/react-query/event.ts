import { Attendee } from '@/types/attendee';
import { Event } from '@/types/Events';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  eventAPI,
  GetAttendeeByEventIdParams,
  UpdateEventSubmissionType,
} from '../axios/event-API';
import { CreateEventSubmissionType } from '../zod/event';

interface ErrorResponse {
  message?: string;
}

const EVENTS_QUERY_KEY = 'events';

export const useEventQuery = (id: string) => {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, id],
    queryFn: () => eventAPI.getEventById(id),
    enabled: !!id,
  });
};

export const useGetEvent = () => {
  return useQuery({
    queryKey: ['event'],
    queryFn: () => eventAPI.getEvent(),
  });
};

export const useCreateEvent = () => {
  const router = useRouter();
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, CreateEventSubmissionType>({
    mutationFn: eventAPI.createEvent,
    onSuccess: ({ data }) => {
      toast.success('Event created successfully');
      console.log(data);
      const url = `/${data.event.slug}`;
      // console.log(url);
      router.push(url);
    },
    onError: (error) => {
      toast.error(error.response?.data.message || 'An error occurred');
    },
  });
};

export const useEditEventSlug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventAPI.editEventSlug,
    onSuccess: (_, { eventId }) => {
      toast.success('Event URL updated successfully');
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, eventId] });
    },
    onError: () => toast.error('An error occurred'),
  });
};

export const useDeleteEventMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: eventAPI.deleteEvent,
    onSuccess: (_, eventId) => {
      toast.success('Event cancelled and deleted successfully');
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, eventId] });
      router.push('/');
    },
    onError: () => toast.error('An error occurred'),
  });
};

export const useGetEventById = (eventId: string) => {
  return useQuery<{ event: Event; totalAttendees: number }, AxiosError<ErrorResponse>>({
    queryFn: async () => {
      const response = await eventAPI.getEventById(eventId);
      return { event: response.event, totalAttendees: response.totalAttendees };
    },
    queryKey: ['attendees', eventId],
  });
};

export const useGetAttendeeByEventId = (filter: GetAttendeeByEventIdParams) => {
  return useQuery<{ attendees: Attendee[]; total: number }, AxiosError<ErrorResponse>>({
    queryFn: async () => {
      const response = await eventAPI.getEventAttendees(filter);
      const attendees = Array.from(response.data.data).map(
        (attendee) => new Attendee(attendee as any)
      );
      return { attendees, total: response.data.total };
    },
    queryKey: ['attendees', filter],
  });
};

export const useGetAttendeeExcelByEventId = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, GetAttendeeByEventIdParams>({
    mutationFn: eventAPI.getEventAttendeesExcel,
  });
};

export const useUpdateEvent = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, UpdateEventSubmissionType>({
    mutationFn: eventAPI.updateEvent,
    onSuccess: () => {
      toast.success('Event updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data.message || 'An error occurred');
    },
  });
};

export const useCreateAttendee = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, string>({
    mutationFn: eventAPI.createAttendee,
    onSuccess: () => {
      toast.success('Attendee created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data.message || 'An error occurred');
    },
  });
};

export const useSoftDeleteAttendee = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, string>({
    mutationFn: eventAPI.softDeleteAttendee,
    onSuccess: () => {
      toast.success('Registration cancelled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data.message || 'Failed to cancel registration');
    },
  });
};

export const useGetAttendeeDetails = (eventId: string) => {
  return useQuery({
    queryKey: ['event', eventId, 'ticket'],
    queryFn: () => eventAPI.getAttendee(eventId),
    retry: 1,
    enabled: !!eventId,
  });
};

export const useCancelEvent = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, { eventId: string }>({
    mutationFn: ({ eventId }) => eventAPI.cancelEvent(eventId),
    onSuccess: () => toast.success('Event cancelled successfully'),
    onError: () => toast.error('An error occurred'),
  });
};

export const useAllowedGuestColumn = (eventId: string, userId: string) => {
  return useQuery({
    queryKey: ['allowStatus', eventId, userId],
    queryFn: async () => {
      const response = await eventAPI.checkAllowStatus(eventId, userId);
      return response.data.data.hasAccess;
    },
    select: (hasAccess) => hasAccess,
  });
};

export const useUpdateAllowStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      userId,
      allowedStatus,
    }: {
      eventId: string;
      userId: string;
      allowedStatus: boolean;
    }) => eventAPI.updateAttendeeAllowStatus(eventId, userId, allowedStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
    },
  });
};

export const usePopularEvents = (limit?: number) => {
  return useQuery({
    queryKey: ['popular-events', limit],
    queryFn: () => eventAPI.getPopularEvents(limit),
  });
};
