import { UpdateProfilePayload } from '../zod/profile';
import api from './instance';

export const userAPI = {
  updateProfile: async (payload: UpdateProfilePayload) => {
    return api.post('/users/profile', payload);
  },

  getUserByUsername: async (username: string) => {
    return api.get(`/users/${username}`);
  },
};
