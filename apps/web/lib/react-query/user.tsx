import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { userAPI } from '../axios/user-API';
import { UpdateProfilePayload } from '../zod/profile';
import { useRouter } from 'next/navigation';

export const useProfileUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse, Error, UpdateProfilePayload>({
    mutationFn: userAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated successfully');
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  });
};

export const useDeactivateAccount = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<AxiosResponse, Error, string>({
    mutationFn: userAPI.deactivateAccount,
    onSuccess: () => {
      toast.success('Account deactivated successfully');
      queryClient.clear();
      router.push('/');
      router.refresh();
    },
  });
};

export const useUserDetailsByUsername = (username: string) => {
  return useQuery({
    queryKey: ['username', username],
    queryFn: () => userAPI.getUserByUsername(username),
  });
};
