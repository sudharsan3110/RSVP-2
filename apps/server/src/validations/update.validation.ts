import z from 'zod';

export const uploadImageSchema = z.object({
  query: z.object({
    filename: z.string(),
  }),
});

export const getMessageSchema = z.object({
  params: z.object({
    eventId: z.string().uuid(),
  }),
});
