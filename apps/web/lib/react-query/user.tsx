import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { userAPI } from '../axios/user-API';
import { UpdateProfilePayload } from '../zod/profile';

export const useProfileUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse, Error, UpdateProfilePayload>({
    mutationFn: userAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast('Profile updated successfully');
    },
    onError: ({ message }) => {
      toast(message);
    },
  });
};
