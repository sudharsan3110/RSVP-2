import z from 'zod';

export const attendeePayloadSchema = z.object({
  feedback: z.string().max(512).optional(),
});

export const attendeeParamsSchema = z.object({
  eventId: z.string().uuid(),
});

export const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export const editSlugSchema = z.object({
  slug: z.string().min(1).max(100),
});

export const attendeeIdSchema = z.object({
  attendeeId: z.string().uuid(),
});

export const verifyQrTokenParamsSchema = z.object({
  attendeeId: z.string().uuid(),
  eventId: z.string().uuid(),
});

export const qrTokenSchema = z.object({
  qrToken: z.string().length(6),
});

export const upcomingEventsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().positive().default(1).optional(),
  limit: z.coerce.number().positive().default(10).optional(),
});