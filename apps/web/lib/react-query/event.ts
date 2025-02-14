import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { CreateEventSubmissionType } from '../zod/event';
import {
  eventAPI,
  GetAttendeeByEventIdParams,
  UpdateEventSubmissionType,
} from '../axios/event-API';
import { Attendee } from '@/types/attendee';
import { IEvent } from '@/types/event';
import { useRouter } from 'next/navigation';

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
  return useQuery<{ event: IEvent; totalAttendees: number }, AxiosError<ErrorResponse>>({
    queryFn: async () => {
      const response = await eventAPI.getEventById(eventId);
      const data = response.data;
      return { event: response.data.event, totalAttendees: data.totalAttendees };
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

export const useGetEventById = (id: string) => {
  return useQuery<IEvent, AxiosError<ErrorResponse>>({
    queryKey: ['event', 'id', id],
    queryFn: async () => {
      const response = await eventAPI.getEventById(id);
      return response.event;
    },
  });
};

export const useGetEventDetails = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, string>({
    mutationFn: eventAPI.getEventById,
  });
};

export const useGetAttendeeDetails = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, { eventId: string; userId: string }>(
    { mutationFn: eventAPI.getAttendee }
  );
};

export const useCancelEvent = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, { eventId: string }>({
    mutationFn: ({ eventId }) => eventAPI.cancelEvent(eventId),
    onSuccess: () => toast.success('Event cancelled successfully'),
    onError: () => toast.error('An error occurred'),
  });
};
