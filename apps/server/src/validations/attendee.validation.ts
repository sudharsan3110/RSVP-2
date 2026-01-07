import z from 'zod';
import { uuidSchema } from './common';
import config from '@/config/config';

export const attendeePayloadSchema = z.object({
  body: z.object({ feedback: z.string().max(512).optional() }),
  params: z.object({ eventId: uuidSchema }),
});

export const invitesAttendeesPayloadSchema = z.object({
  body: z.object({
    emails: z.preprocess(
      (value) => {
        if (!Array.isArray(value)) return [];

        // Normalize
        let cleaned = value
          .filter((v) => typeof v === 'string')
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email.length > 0);

        // Deduplicate
        cleaned = [...new Set(cleaned)];

        return cleaned;
      },
      z.array(z.string().email('Invalid email address')).max(Number(config.MAX_INVITES))
    ),
  }),

  params: z.object({
    eventId: uuidSchema,
  }),
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
  query: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().default(10),
  }),
});

export const updateAttendeeStatusParamsSchema = z.object({
  attendeeId: z.string().uuid(),
  eventId: z.string().uuid(),
});

export const attendeeStatusUpdateSchema = z.object({
  allowedStatus: z.boolean(),
});

export type UpcomingEventsQuery = z.infer<typeof upcomingEventsQuerySchema>;
