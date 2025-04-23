import z from 'zod';

const secondaryEmailSchema = z
  .object({ secondaryEmail: z.string().email().or(z.null()) })
  .strict();

const contactNumberSchema = z.object({ contact: z.string() }).strict();

const fullProfileSchema = z
  .object({
    fullName: z.string().min(1),
    location: z.string(),
    bio: z.string(),
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

export const usernameSchema = z.object({
  userName: z.string(),
});
