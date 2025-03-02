import z from 'zod';
import { paginationParamsSchema } from './pagination.validation';

export enum PAGINATION_ORDER {
  ASC = 'asc',
  DESC = 'desc',
}

export enum VENUE_TYPE {
  PHYSICAL = 'physical',
  VIRTUAL = 'virtual',
}

export const DATE_RANGE = {
  LOW: new Date('1970-01-01T00:00:00.000Z'),
  HIGH: new Date('9999-12-31T23:59:59.999Z'),
} as const;

export const getEventBySlugSchema = z.object({
  slug: z.string(),
});

export const EventSchema = z.object({
  name: z.string().max(256),
  category: z.string().max(256),
  description: z.string().max(512),
  eventImageId: z.string().max(256),
  venueType: z.enum(['physical', 'virtual', 'later']),
  venueAddress: z.string().max(256).optional(),
  venueUrl: z.string().url().max(256).optional(),
  hostPermissionRequired: z.boolean(),
  capacity: z.number().int().positive().max(100),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  eventDate: z.coerce.date(),
});

export const CreateEventSchema = EventSchema.strict()
  .refine(
    (data) => {
      if (data.venueType === 'physical') {
        return data.venueAddress !== null && data.venueUrl == null;
      }
      if (data.venueType === 'virtual') {
        return data.venueUrl !== null && data.venueAddress == null;
      }
      if (data.venueType === 'later') {
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
      const currentDate = new Date(currentDateTime.setHours(0, 0, 0, 0));
      const eventDate = new Date(data.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);

      if (!(eventDate >= currentDate)) {
        return false;
      }
      if (!(startTime > currentDateTime)) {
        return false;
      }
      if (!(endTime > startTime)) {
        return false;
      }

      return true;
    },
    {
      message: 'Event dates must be valid: event date must be in the future',
      path: ['eventDate', 'startTime', 'endTime'],
    }
  );

export const UpdateEventSchema = EventSchema.partial();

export const eventsPlannedByUserReqSchema = z.object({
  search: z.string().min(1).max(256).optional(),
  category: z.string().min(1).max(256).optional(),
  fromDate: z.coerce.date().default(() => DATE_RANGE.LOW),
  toDate: z.coerce.date().default(() => DATE_RANGE.HIGH),
  venueType: z.enum([VENUE_TYPE.PHYSICAL, VENUE_TYPE.VIRTUAL]).optional(),
  page: z.coerce.number().positive().default(1).optional(),
  limit: z.coerce.number().positive().default(10).optional(),
  sortBy: z.string().max(256).optional(),
  sortOrder: z.enum([PAGINATION_ORDER.ASC, PAGINATION_ORDER.DESC]).optional(),
});

export const eventAttendeeReqSchema = z.object({
  eventId: z.string().max(256),
});
export const userUpdateSchema = z.object({
  content: z.string(),
});

export const eventParamsSchema = z.object({
  eventId: z.string(),
});

export const eventLimitSchema = z.object({
  limit: z.coerce.number().gte(1).default(3),
});

export const attendeesQuerySchema = z.object({
  ...paginationParamsSchema.shape,
  hasAttended: z.preprocess((val) => {
    if (val === 'false') return false;
    if (val === 'true') return true;
    return undefined;
  }, z.boolean().optional()),
});
