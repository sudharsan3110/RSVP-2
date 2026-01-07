'use client';

import { User } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  authAPI,
  SigninPayload,
  GoogleSigninPayload,
  VerifySigninPayload,
} from '../axios/auth-API';
import { clearLocalStorage } from '@/hooks/useLocalStorage';
import { FORM_CACHE_KEY } from '@/utils/constants';
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

export const useGoogleSignin = () => {
  const router = useRouter();
  return useMutation<AxiosResponse, Error, GoogleSigninPayload>({
    mutationFn: authAPI.googleSignin,
    onSuccess: ({ data }) => {
      if (data.data.user.isCompleted) {
        router.push('/events');
      } else {
        router.push('/profile');
      }
    },
    onError: () => {
      toast.error('Failed to login. Please try again.');
    },
  });
};

export const useGoogleOAuth = () => {
  const loginWithGoogle = async () => {
    try {
      const res = await authAPI.getGoogleAuthUrl();
      const redirectUrl = res.data.details.redirect;
      window.location.href = redirectUrl;
    } catch {
      toast.error('Failed to login. Please try again.');
    }
  };

  return { loginWithGoogle };
};

export const useVerifySignin = () => {
  const router = useRouter();
  return useMutation<AxiosResponse<VerifySignInResponse>, Error, VerifySigninPayload>({
    mutationFn: authAPI.verifySignin,
    onSuccess: ({ data }) => {
      const redirectUrl = window.localStorage.getItem('redirect');
      const eventFormData = window.localStorage.getItem('eventFormData');

      if (eventFormData) {
        router.push('/create-event');
      } else {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (data.data.user.isCompleted) {
          router.push('/events');
        } else {
          router.push('/profile');
        }
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
      clearLocalStorage(FORM_CACHE_KEY);
      queryClient.clear();
      router.push('/');
      router.refresh();
    },
    onError: () => {
      toast.error('Failed to logout. Please try again.');
    },
  });
};
