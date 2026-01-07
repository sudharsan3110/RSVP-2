import { VenueType } from '@/types/events';
import { combineDateAndTime } from '@/utils/time';
import { z } from 'zod';

export const createEventFormSchema = z
  .object({
    isEditing: z.boolean().optional(),
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
    plaintextDescription: z.string().optional(),
    venueType: z.nativeEnum(VenueType),
    location: z.string().optional(),
    locationMapUrl: z
      .string()
      .trim()
      .url('Please enter a valid URL')
      .or(z.literal(''))
      .transform((val) => (val === '' ? undefined : val))
      .optional(),
    // .refine(
    //   (val) => {
    //     if (val == '' || !val) return true;
    //     else {
    //       const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    //       return urlPattern.test(val);
    //     }
    //   },
    //   {
    //     message: 'Please enter a valid URL',
    //   }
    // ),
    hostPermissionRequired: z.boolean(),
    discoverable: z.boolean(),
    capacity: z.coerce
      .number({
        required_error: 'Capacity is required',
        invalid_type_error: 'Capacity must be a number',
      })
      .int()
      .positive()
      .min(1, { message: 'Capacity should be at least 1' })
      .max(1000, { message: 'The capacity must be between 1 and 1000' }),
    eventImageUrl: z.string().url('Event Image is required').nullable(),
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

    const image = data.eventImageUrl;
    if (!image) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Event image is required',
        path: ['eventImageUrl'],
      });
    }

    if (!data.isEditing && fromDateTime <= now) {
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
  richtextDescription: string;
  plaintextDescription?: string;
  eventImageUrl: string;
  venueType: VenueType;
  venueAddress?: string;
  venueUrl?: string;
  hostPermissionRequired: boolean;
  discoverable: boolean;
  capacity: number;
  startTime: Date;
  endTime: Date;
};

export type EventFromProps = {
  defaultValues: CreateEventFormType;
  isEditing?: boolean;
  isLoading: boolean;
  onSubmit: (data: CreateEventFormType) => void;
  requireSignIn?: boolean;
  setPersistentValue?: (data: CreateEventFormType) => void;
  eventCategoryOptions?: FormSelectOption[];
};
