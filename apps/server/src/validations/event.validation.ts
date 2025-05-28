import z from 'zod';
import { paginationParamsSchema } from './pagination.validation';
import { Status, VenueType } from '@prisma/client';
import { editSlugSchema } from './attendee.validation';
import { uuidSchema } from './common';

export enum PAGINATION_ORDER {
  ASC = 'asc',
  DESC = 'desc',
}

export const DATE_RANGE = {
  LOW: new Date('1970-01-01T00:00:00.000Z'),
  HIGH: new Date('9999-12-31T23:59:59.999Z'),
} as const;

export const SlugSchema = z.object({
  slug: z.string(),
});

export const cancelEventSchema = z.object({
  params: z.object({ eventId: uuidSchema }),
});

export const deleteEventSchema = z.object({
  params: z.object({ eventId: uuidSchema }),
});

export const eventSlugSchema = z.object({ params: SlugSchema });

export const getEventByIdSchema = z.object({ params: z.object({ eventId: uuidSchema }) });

export const updateEventSlugSchema = z.object({
  params: z.object({ eventId: uuidSchema }),
  body: editSlugSchema,
});

export const EventSchema = z.object({
  name: z.string().max(256),
  category: z.string().max(256),
  description: z.string().max(512),
  eventImageUrl: z.string().max(256),
  venueType: z.enum([VenueType.PHYSICAL, VenueType.VIRTUAL, VenueType.LATER]),
  venueAddress: z.string().max(256).optional(),
  venueUrl: z.string().url().max(256).optional(),
  hostPermissionRequired: z.boolean(),
  capacity: z.number().int().positive().max(100),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  eventDate: z.coerce.date(),
});

export const CreateEventSchema = z.object({
  body: EventSchema.strict()
    .refine(
      (data) => {
        if (data.venueType === VenueType.PHYSICAL) {
          return data.venueAddress !== null && data.venueUrl == null;
        }
        if (data.venueType === VenueType.VIRTUAL) {
          return data.venueUrl !== null && data.venueAddress == null;
        }
        if (data.venueType === VenueType.LATER) {
          return data.venueUrl == null && data.venueAddress == null;
        }
        return false;
      },
      {
        message:
          'Physical events must have a venue address (not URL), virtual events must have a URL (not address)',
        path: ['venueType'],
      }
    )
    .refine(
      (data) => {
        const currentDateTime = new Date();

        const currentDateStr = currentDateTime.toISOString().split('T')[0] ?? '';
        const eventDateStr = data.eventDate.toISOString().split('T')[0] ?? '';

        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);

        const eventStartDateTime = new Date(data.eventDate);
        eventStartDateTime.setUTCHours(
          startTime.getUTCHours(),
          startTime.getUTCMinutes(),
          startTime.getUTCSeconds()
        );

        if (eventDateStr < currentDateStr) {
          return false;
        }

        if (eventStartDateTime <= currentDateTime) {
          return false;
        }
        if (endTime <= startTime) {
          return false;
        }

        return true;
      },
      {
        message: 'Event dates must be valid: event date must be in the future',
        path: ['eventDate', 'startTime', 'endTime'],
      }
    ),
});

export const UpdateEventSchema = z.object({
  body: EventSchema.partial(),
  params: z.object({ eventId: uuidSchema }),
});

export const eventsPlannedByUserReqSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    fromDate: z.coerce.date().default(() => DATE_RANGE.LOW),
    toDate: z.coerce.date().default(() => DATE_RANGE.HIGH),
    venueType: z.enum([VenueType.PHYSICAL, VenueType.VIRTUAL]).optional(),
    page: z.coerce.number().positive().default(1).optional(),
    limit: z.coerce.number().positive().default(10).optional(),
    sortBy: z.string().max(256).optional(),
    sortOrder: z.enum([PAGINATION_ORDER.ASC, PAGINATION_ORDER.DESC]).optional(),
    status: z
      .enum(['active', 'cancel', 'all'])
      .optional()
      .default('all')
      .or(z.literal('').transform(() => 'all')), // Transform empty string to 'all'
  }),
});

export const userUpdateSchema = z.object({
  body: z.object({
    content: z.string(),
  }),
  params: z.object({
    eventId: z.string().uuid(),
  }),
});

export const getEvent = z.object({
  eventId: z.string().uuid(),
});

export const eventLimitSchema = z.object({
  query: z.object({
    limit: z.coerce.number().gte(1).default(3),
  }),
});

export const attendeesQuerySchema = z.object({
  ...paginationParamsSchema.shape,
  hasAttended: z.preprocess((val) => {
    if (val === 'false') return false;
    if (val === 'true') return true;
    return undefined;
  }, z.boolean().optional()),
  search: z.string().optional(),
  status: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (typeof val === 'string') {
        return val.split(',');
      }
      return val;
    })
    .refine(
      (statuses) => {
        if (!statuses) return true;
        const validStatusValues = Object.values(Status);
        return statuses.every((status) => validStatusValues.includes(status as Status));
      },
      {
        message: `One or more status values are invalid. Valid statuses are: ${Object.values(Status).join(', ')}`,
      }
    ),
});

export const eventFilterSchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().default(10),
    location: z.string().optional(),
    category: z.string().optional(),
    sortOrder: z.enum([PAGINATION_ORDER.ASC, PAGINATION_ORDER.DESC]).default(PAGINATION_ORDER.DESC),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
});

export type EventFilter = z.infer<typeof eventFilterSchema>['query'];

export const updateAttendeeStatusSchema = z.object({
  params: z.object({ attendeeId: z.string().uuid() }),
  body: z.object({ allowedStatus: z.boolean() }),
});

export const scanTicketSchema = z.object({
  params: z.object({ eventId: uuidSchema, qrToken: z.string() }),
});

export const verifyQrSchema = z.object({
  params: z.object({ eventId: uuidSchema, attendeeId: uuidSchema }),
});
