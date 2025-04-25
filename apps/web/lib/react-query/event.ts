import { Attendee } from '@/types/attendee';
import { Event } from '@/types/events';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  eventAPI,
  EventParams,
  GetAttendeeByEventIdParams,
  PaginationMetadata,
  UpdateEventSubmissionType,
} from '../axios/event-API';
import { CreateEventSubmissionType } from '../zod/event';

interface ErrorResponse {
  message?: string;
}

const EVENTS_QUERY_KEY = 'events';
const EVENT_COHOST_KEY = 'cohost';
const ATTENDEE_QUERY_KEY = 'attendees';

export const useEventQuery = (id: string) => {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, id],
    queryFn: () => eventAPI.getEventById(id),
    enabled: !!id,
  });
};

export const useGetEvent = (params: EventParams) => {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, params],
    queryFn: () => eventAPI.getEvent(params),
  });
};

export const useGetDiscoverEvents = (params: EventParams) => {
  return useInfiniteQuery({
    queryKey: [EVENTS_QUERY_KEY, params],
    queryFn: ({ pageParam }) => eventAPI.getEvent({ ...params, page: Number(pageParam ?? '1') }),
    getNextPageParam: (lastPage: { metadata?: PaginationMetadata }) => lastPage.metadata?.hasMore ? lastPage.metadata?.page + 1 : undefined,
    initialPageParam: 1,
  });
};

export const useGetMyEvents = (filters: EventParams) => {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, 'my-events', filters],
    queryFn: () => eventAPI.getMyEvents(filters),
  });
};

export const useGetUpcomingEvents = (filters: EventParams) => {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, 'upcoming-events', filters],
    queryFn: () => eventAPI.getUpcomingEvents(filters),
  });
};

export const useCreateEvent = () => {
  const router = useRouter();
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, CreateEventSubmissionType>({
    mutationFn: eventAPI.createEvent,
    onSuccess: ({ data }) => {
      toast.success('Event created successfully');
      const url = `/${data.event.slug}`;
      router.push(url);
    },
    onError: (error) => {
      toast.error(error.response?.data.message || 'An error occurred');
    },
  });
};

export const useGetAttendeeByTicketCode = ({
  ticketCode,
  eventId,
}: {
  ticketCode: string;
  eventId: string;
}) => {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, eventId, ATTENDEE_QUERY_KEY, ticketCode],
    queryFn: () => eventAPI.getAttendeeByTicketCode({ eventId, ticketCode }),
    retry: 1,
    enabled: !!(ticketCode && eventId),
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

export const useCancelEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventAPI.cancelEvent,
    onSuccess: (_, eventId) => {
      toast.success('Event cancelled successfully');
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

export const useGetEventById = (eventId?: string) => {
  return useQuery<{ event: Event; totalAttendees: number }, AxiosError<ErrorResponse>>({
    queryFn: eventId
      ? async () => {
        const response = await eventAPI.getEventById(eventId);
        return { event: response.event, totalAttendees: response.totalAttendees };
      }
      : undefined,
    enabled: !!eventId,
    queryKey: [EVENTS_QUERY_KEY, eventId],
  });
};

export const useGetAttendeeByEventId = (filter: GetAttendeeByEventIdParams) => {
  return useQuery<{ attendees: Attendee[]; total: number }, AxiosError<ErrorResponse>>({
    queryFn: async () => {
      const response = await eventAPI.getEventAttendees(filter);
      const attendees = Array.from(response.data.data).map(
        (attendee) => new Attendee(attendee as Attendee)
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

export const useVerifyAttendee = () => {
  return useMutation<
    AxiosResponse,
    AxiosError<ErrorResponse>,
    { eventId: string; attendeeId: string }
  >({
    mutationFn: eventAPI.verifyAttendee,
  });
};
export const useGetAttendeeTicketDetails = (eventId: string) => {
  return useQuery({
    queryKey: ['event', eventId, 'ticket'],
    queryFn: () => eventAPI.getAttendeeTicketDetail(eventId),
    retry: 1,
    enabled: !!eventId,
  });
};

export const useCancelEvent = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, { eventId: string }>({
    mutationFn: ({ eventId }) => eventAPI.cancelEventAttendee(eventId),
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

{
  /* Manage Cohost */
}
export const useGetEventCohosts = (eventId: string) => {
  return useQuery({
    queryKey: [EVENT_COHOST_KEY, eventId],
    queryFn: () => eventAPI.getEventCohosts(eventId),
  });
};

export const useAddEventCohost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      cohostEmail,
      role,
    }: {
      eventId: string;
      cohostEmail: string;
      role: string;
    }) => eventAPI.createEventCohost(eventId, { cohostEmail: cohostEmail, role: role }),

    onSuccess: (resp, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: [EVENT_COHOST_KEY, eventId] });
      toast.success(`Cohost added succesfull`);
    },

    onError: (resp: AxiosError) => {
      const errMsg = resp.response?.data as ErrorResponse | undefined;
      toast.error(errMsg?.message ?? resp.message ?? 'An unexpected error occured');
    },
  });
};

export const useDeleteCohost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, cohostId }: { eventId: string; cohostId: string }) =>
      eventAPI.deleteEventCohost(eventId, cohostId),
    onSuccess: (resp, { eventId }) => {
      toast.success(resp?.message);
      queryClient.invalidateQueries({ queryKey: [EVENT_COHOST_KEY, eventId] });
    },
    onError: (resp: AxiosError) => {
      const errMsg = resp.response?.data as ErrorResponse | undefined;
      toast.error(errMsg?.message ?? resp.message ?? 'An unexpected error occured');
    },
  });
};
