import z from 'zod';

const secondaryEmailSchema = z
  .object({ secondary_email: z.string().email().or(z.null()) })
  .strict();

const contactNumberSchema = z.object({ contact: z.string() }).strict();

const fullProfileSchema = z
  .object({
    full_name: z.string().min(1),
    location: z.string(),
    bio: z.string(),
    profile_icon: z.string().default('1'),
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
  username: z.string(),
});
