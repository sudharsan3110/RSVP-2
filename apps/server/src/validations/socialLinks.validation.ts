import { Platform } from '@prisma/client';
import z from 'zod';

export const getSocialLinksSchema = z.object({
  // No body validation needed for authenticated user's own social links
});

export const getSocialLinksByUserIdSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
});

export const updateSocialLinksSchema = z.object({
  body: z.array(
    z.object({
      type: z.nativeEnum(Platform),
      handle: z.string(),
    })
  ),
});
