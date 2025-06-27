import z from 'zod';
import { disposableEmailValidator } from '../utils/disposableEmailBlocklist';

export const SigninSchema = z.object({
  body: z.object({
    email: disposableEmailValidator,
  }),
});

export const verifySigninSchema = z.object({
  body: z.object({
    token: z.string().min(1, { message: 'token is required' }),
  }),
});
