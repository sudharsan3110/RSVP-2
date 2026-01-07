import z from 'zod';
import { disposableEmailValidator } from '../utils/disposableEmailBlocklist';

const secondaryEmailSchema = z
  .object({ secondaryEmail: disposableEmailValidator.or(z.null()) })
  .strict();

const contactNumberSchema = z.object({ contact: z.string() }).strict();

export const fullProfileSchema = z
  .object({
    fullName: z.string().min(1),
    location: z.string(),
    bio: z.string().max(500),
    profileIcon: z.coerce.number().default(1),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    website: z.string().optional(),
  })
  .strict();

export const profilePayloadSchema = z.union([
  secondaryEmailSchema,
  contactNumberSchema,
  fullProfileSchema,
]);

export const updateProfileSchema = z.object({
  body: profilePayloadSchema,
});

export const usernameSchema = z.object({
  params: z.object({
    username: z.string(),
  }),
});

export const userParamsSchema = z.object({
  userId: z.string().uuid(),
});
