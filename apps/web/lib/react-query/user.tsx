import { useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { userAPI } from '../axios/user-API';
import { UpdateProfilePayload } from '../zod/profile';

export const useProfileUpdate = () => {
  return useMutation<AxiosResponse, Error, UpdateProfilePayload>({
    mutationFn: userAPI.updateProfile,
    onSuccess: () => {
      toast('Profile updated successfully');
    },
    onError: ({ message }) => {
      toast(message);
    },
  });
};
