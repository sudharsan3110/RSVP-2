import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { eventAPI } from '../axios/event-API';
import { CommunicationForm } from '../zod/communication';

// Query hook to fetch communications
export const useEventCommunications = (eventId: string) => {
  return useQuery({
    queryKey: ['event-communications', eventId],
    queryFn: () => eventAPI.getEventCommunications(eventId),
  });
};

// Mutation hook to create communication
export const useCreateEventCommunication = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, AxiosError, CommunicationForm>({
    mutationFn: (data) => eventAPI.createEventCommunication(eventId, data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['event-communications', eventId] });
      toast.success('Message sent successfully');
    },
    onError: (error) => {
      const axiosError = error as AxiosError;
      const errorMessage =
        (axiosError.response?.data as { message: string })?.message || 'Failed to send message';
      toast.error(errorMessage);
    },
  });
};
