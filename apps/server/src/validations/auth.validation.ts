import z from 'zod';

export const SigninSchema = z.object({
  email: z.string().min(1, { message: 'email is required' }).email(),
});

export const verifySigninSchema = z.object({
  token: z.string().min(1, { message: 'token is required' }),
});
