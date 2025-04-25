import { User } from '@/types/user';
import api from './instance';

export type SigninPayload = {
  email: string;
};

export type VerifySigninPayload = {
  token: string;
};

export type SignoutPayload = {
  userId: string;
};

export const authAPI = {
  signin: (payload: SigninPayload) => api.post('/auth/signin', payload),

  verifySignin: (payload: VerifySigninPayload) => api.post('/auth/verify-signin', payload),

  currentUser: async () => {
    const response = await api.get('/auth/me');
    return new User(response.data.data);
  },

  signout: (payload: SignoutPayload) => api.post('/auth/logout', payload),
};
