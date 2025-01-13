import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { CreateEventSubmissionType } from '../zod/event';
import { eventAPI } from '../axios/event-API';

interface ErrorResponse {
  message?: string;
}

export const useCreateEvent = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, CreateEventSubmissionType>({
    mutationFn: eventAPI.createEvent,
    onSuccess: () => {
      toast.success('Event created successfully');
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

export const useGetEventDetails = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, string>({
    mutationFn: eventAPI.getEventById,
  });
};

export const useGetAttendeeDetails = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, { eventId: string; userId: string }>(
    {
      mutationFn: eventAPI.getAttendee,
    }
  );
};
