import { VenueType } from '@/types/events';
import { combineDateAndTime } from '@/utils/time';
import { z } from 'zod';

export const createEventFormSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Event Name must be at least 2 characters.',
    }),
    category: z.string({
      required_error: 'Please select a category.',
    }),
    fromDate: z.coerce.date({
      required_error: 'From date is required',
    }),
    fromTime: z.string({
      required_error: 'From time is required',
    }),
    toDate: z.coerce.date({
      required_error: 'To date is required',
    }),
    toTime: z.string({
      required_error: 'To time is required',
    }),
    description: z.string(),
    venueType: z.nativeEnum(VenueType),
    location: z.string().optional(),
    hostPermissionRequired: z.boolean(),
    capacity: z.coerce
      .number({
        required_error: 'Capacity is required',
        invalid_type_error: 'Capacity must be a number',
      })
      .int()
      .positive()
      .min(1, { message: 'Capacity should be at least 1' })
      .max(100, { message: 'Capacity should be at most 100' }),
    eventImageUrl: z.object({
      file: z.string().nullable(),
      url: z.string().nullable(),
      signedUrl: z.string().nullable(),
    }),
    fromDateTime: z.string().optional(),
    toDateTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.venueType === VenueType.Physical) {
        return data.location && data.location.length > 0;
      }
      if (data.venueType === VenueType.Virtual) {
        try {
          new URL(data.location || '');
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message:
        'Location must be a valid address for physical events or a valid URL for virtual events.',
      path: ['location'],
    }
  )
  .superRefine((data, ctx) => {
    const fromDateTime = combineDateAndTime(data.fromDate, data.fromTime);
    const toDateTime = combineDateAndTime(data.toDate, data.toTime);
    const now = new Date();

    const image = data.eventImageUrl.file || data.eventImageUrl.url;
    if (!image) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Event image is required',
        path: ['eventImageUrl'],
      });
    }

    if (fromDateTime <= now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'From date and time must be greater than current time',
        path: ['fromDateTime'],
      });
    }

    if (toDateTime <= fromDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'To date and time must be greater than from date and time',
        path: ['toDateTime'],
      });
    }
  });

export type CreateEventFormType = z.infer<typeof createEventFormSchema>;

export type CreateEventSubmissionType = {
  name: string;
  category: string;
  description: string;
  eventImageUrl: string;
  venueType: VenueType;
  venueAddress?: string;
  venueUrl?: string;
  hostPermissionRequired: boolean;
  capacity: number;
  startTime: Date;
  endTime: Date;
  eventDate: Date;
};
