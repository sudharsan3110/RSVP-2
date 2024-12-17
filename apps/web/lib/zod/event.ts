import { combineDateAndTime } from '@/utils/time';
import { z } from 'zod';

export const createEventFormSchema = z
  .object({
    eventname: z.string().min(2, {
      message: 'Event Name must be at least 2 characters.',
    }),
    category: z.string({
      required_error: 'Please select a category.',
    }),
    fromDate: z.date({
      required_error: 'From date is required',
    }),
    fromTime: z.string({
      required_error: 'From time is required',
    }),
    toDate: z.date({
      required_error: 'To date is required',
    }),
    toTime: z.string({
      required_error: 'To time is required',
    }),
    description: z.string(),
    locationType: z.enum(['venue', 'online'] as const),
    location: z.string().min(2, {
      message: 'Location must be at least 2 characters.',
    }),
    requiresApproval: z.boolean(),
    capacity: z.coerce
      .number({
        required_error: 'Capacity is required',
        invalid_type_error: 'Capacity must be a number',
      })
      .int()
      .positive()
      .min(1, { message: 'Capacity should be at least 1' }),
    fromDateTime: z.string().optional(),
    toDateTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const fromDateTime = combineDateAndTime(data.fromDate, data.fromTime);
    const toDateTime = combineDateAndTime(data.toDate, data.toTime);
    const now = new Date();

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
