'use client';

import { User } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authAPI, SigninPayload, VerifySigninPayload } from '../axios/auth-API';

interface VerifySignInResponse {
  success: boolean;
  data: { user: User };
}

interface ErrorResponse {
  message: string;
}

export const useSignInMutation = () => {
  return useMutation<AxiosResponse, AxiosError<ErrorResponse>, SigninPayload>({
    mutationFn: authAPI.signin,
    onSuccess: () => {
      toast.success('Magic link sent to your email. Please check your inbox.');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to send magic link. Please try again.');
    },
  });
};

export const useVerifySignin = () => {
  const router = useRouter();
  return useMutation<AxiosResponse<VerifySignInResponse>, Error, VerifySigninPayload>({
    mutationFn: authAPI.verifySignin,
    onSuccess: ({ data }) => {
      if (data.data.user.isCompleted) {
        router.push('/events');
      } else {
        router.push('/profile');
      }
    },
    onError: ({ message }) => {
      toast(message);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: authAPI.currentUser,
    retry: 0,
  });
};

export const useSignout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.signout,
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
      router.refresh();
    },
    onError: (error) => {
      console.error('Logout error:', error);
    },
  });
};
