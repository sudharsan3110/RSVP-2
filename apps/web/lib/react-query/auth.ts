'use client';

import { IUser } from '@/types/user';
import { useMutation, useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authAPI, SigninPayload, VerifySigninPayload } from '../axios/auth-API';
import { AxiosResponse } from 'axios';

interface VerifySignInResponse {
  success: boolean;
  data: { user: IUser };
}

export const useSignInMutation = () => {
  return useMutation<AxiosResponse, Error, SigninPayload>({
    mutationFn: authAPI.signin,
    onSuccess: () => {
      toast('Signin successful');
    },
    onError: () => {
      toast('Something went wrong');
    },
  });
};

export const useVerifySignin = () => {
  const router = useRouter();
  return useMutation<AxiosResponse<VerifySignInResponse>, Error, VerifySigninPayload>({
    mutationFn: authAPI.verifySignin,
    onSuccess: ({ data }) => {
      if (data.data.user.is_completed) {
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

export const useCurrentUser = (): UseQueryResult<AxiosResponse, any> => {
  return useQuery({
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
