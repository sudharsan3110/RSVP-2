import { Attendee } from '@/types/attendee';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  eventAPI,
  EventParams,
  GetAttendeeByEventIdParams,
  InviteGuestsParams,
  PaginationMetadata,
  UpdateEventSubmissionType,
} from '../axios/event-API';
import { CreateEventSubmissionType } from '../zod/event';
import { clearLocalStorage } from '@/hooks/useLocalStorage';
import { FORM_CACHE_KEY } from '@/utils/constants';
interface ErrorResponse {
  message?: string;
}

const EVENTS_QUERY_KEY = 'events';
const EVENT_COHOST_KEY = 'cohost';
const ATTENDEE_QUERY_KEY = 'attendees';

export const useInviteGuests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, emails }: InviteGuestsParams) => {
      const response = await eventAPI.inviteGuests({ eventId, emails });
      return response.data;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({
        queryKey: [ATTENDEE_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [EVENTS_QUERY_KEY, eventId],
      });
    },
  });
};

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
    getNextPageParam: (lastPage: { metadata?: PaginationMetadata }) =>
      lastPage.metadata?.hasMore ? lastPage.metadata?.page + 1 : undefined,
    initialPageParam: 1,
  });
};

export const useGetMyEvents = (filters: EventParams) => {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, 'my-events', filters],
    queryFn: () => eventAPI.getMyEvents(filters),
  });
};

export const useGetMyEventsInifinite = (filters: EventParams) => {
  return useInfiniteQuery({
    queryKey: [EVENTS_QUERY_KEY, 'my-events', filters],
    queryFn: ({ pageParam }) =>
      eventAPI.getMyEvents({ ...filters, page: Number(pageParam ?? '1') }),
    getNextPageParam: (lastPage: { metadata?: PaginationMetadata }) => {
      return lastPage.metadata?.hasMore ? lastPage.metadata?.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useGetUpcomingEvents = (filters: EventParams) => {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, 'upcoming-events', filters],
    select: (data) => data,
    queryFn: () => eventAPI.getUpcomingEvents(filters),
  });
};

export const useCreateEvent = () => {
  const router = useRouter();
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, CreateEventSubmissionType>({
    mutationFn: eventAPI.createEvent,
    onSuccess: ({ data }) => {
      clearLocalStorage(FORM_CACHE_KEY);
      toast.success('Event created successfully');
      const url = `/${data.data.slug}`;
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
    onError: () => {
      toast.error('An error occurred');
    },
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
    onError: () => {
      toast.error('An error occurred');
    },
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
    onError: () => {
      toast.error('An error occurred');
    },
  });
};

export const useGetEventById = (eventId: string) => {
  return useQuery({
    queryFn: async () => eventAPI.getEventById(eventId),
    enabled: !!eventId,
    queryKey: [EVENTS_QUERY_KEY, eventId],
  });
};

export const useGetEventBySlug = (slug: string) => {
  return useQuery({
    queryFn: async () => eventAPI.getEventBySlug(slug),
    enabled: !!slug,
    queryKey: [EVENTS_QUERY_KEY, slug],
  });
};

export const useGetAttendeeByEventId = (filter: GetAttendeeByEventIdParams) => {
  return useQuery<{ attendees: Attendee[]; total: number }, AxiosError<ErrorResponse>>({
    queryFn: async () => {
      const response = await eventAPI.getEventAttendees(filter);
      const attendees = Array.from(response.data.data.data).map(
        (attendee) => new Attendee(attendee as Attendee)
      );
      return { attendees, total: response.data.data.metadata.total };
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
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse,
    AxiosError<ErrorResponse>,
    { eventId: string; requiresApproval: boolean }
  >({
    mutationFn: ({ eventId }) => eventAPI.createAttendee(eventId),
    onSuccess: (_, { eventId, requiresApproval }) => {
      if (requiresApproval) {
        toast.success("You've successfully registered. We'll notify you once it's approved.");
      } else {
        toast.success("Ticket confirmed! You're registered for the event.");
      }
      queryClient.invalidateQueries({ queryKey: ['event', eventId, 'ticket-details'] });
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.response?.data.message || 'An error occurred');
    },
  });
};

export const useSoftDeleteAttendee = () => {
  const router = useRouter();
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, string>({
    mutationFn: eventAPI.softDeleteAttendee,
    onSuccess: () => {
      toast.success('Registration cancelled successfully');
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.response?.data.message || 'Failed to cancel registration');
    },
  });
};

export const useGetAttendeeDetails = (eventId: string) => {
  return useQuery({
    queryKey: ['event', eventId, 'attendee-details'],
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

export const useGetAttendeeTicketDetails = (eventId: string, enable: boolean) => {
  return useQuery({
    queryKey: ['event', eventId, 'ticket-details'],
    queryFn: () => eventAPI.getAttendeeTicketDetail(eventId),
    retry: 0,
    enabled: !!eventId && enable,
  });
};

export const useCancelEvent = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, { eventId: string }>({
    mutationFn: ({ eventId }) => eventAPI.cancelEventAttendee(eventId),
    onSuccess: () => {
      toast.success('Event cancelled successfully');
    },
    onError: () => {
      toast.error('An error occurred');
    },
  });
};

export const useUpdateAttendeeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      attendeeId,
      allowedStatus,
    }: {
      eventId: string;
      attendeeId: string;
      allowedStatus: boolean;
    }) => eventAPI.updateAttendeeStatus(eventId, attendeeId, allowedStatus),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: [ATTENDEE_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [EVENTS_QUERY_KEY, eventId],
      });
    },
  });
};

export const usePopularEvents = (limit?: number) => {
  return useQuery({
    queryKey: ['popular-events', limit],
    queryFn: () => eventAPI.getPopularEvents(limit),
  });
};

export const useUploadEventImage = () => {
  return useMutation<
    { actualUrl: string },
    AxiosError<ErrorResponse>,
    { file: File; onProgress?: (progress: number) => void }
  >({
    mutationFn: async ({ file, onProgress }) => {
      const signedUrl = await eventAPI.getEventImageSignedUrl(file.name);

      await axios.put(signedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      const actualUrl = signedUrl.split('?')[0];
      return { actualUrl };
    },
  });
};

{
  /* Manage Cohost */
}
export const useGetEventCohosts = (eventId: string) => {
  return useQuery({
    queryKey: [EVENT_COHOST_KEY, eventId],
    queryFn: () => eventAPI.getEventCohosts(eventId),
    enabled: !!eventId,
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
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, eventId] });
    },
    onError: (resp: AxiosError) => {
      const errMsg = resp.response?.data as ErrorResponse | undefined;
      toast.error(errMsg?.message ?? resp.message ?? 'An unexpected error occured');
    },
  });
};
