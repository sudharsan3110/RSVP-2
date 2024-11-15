import z from 'zod';

export const attendeePayloadSchema = z.object({
  feedback: z.string().max(512).optional(),
  isAdmin: z.boolean(),
});

export const attendeeParamsSchema = z.object({
  eventId: z.string().uuid(),
});
