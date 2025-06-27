import { z } from 'zod';
import { disposableEmailValidator } from './disposible-mail';

export const secondaryEmailFormSchema = z
  .object({
    email: z.string().email().optional(),
    secondaryEmail: disposableEmailValidator
      .nullable()
      .optional()
      .transform((val) => (val === '' ? null : val)),
  })
  .refine(
    (data) => {
      if (!data.secondaryEmail || !data.email) return true;
      return data.secondaryEmail.toLowerCase() !== data.email.toLowerCase();
    },
    {
      message: "Secondary email can't be the same as primary email",
      path: ['secondaryEmail'],
    }
  );

export type SecondaryEmailFormType = z.infer<typeof secondaryEmailFormSchema>;

export const phoneNumberFormSchema = z.object({
  contact: z
    .string()
    .regex(/^\d+$/, 'Only numbers are allowed')
    .length(10, 'Phone number must be 10 digits'),
});

export type PhoneNumberFormType = z.infer<typeof phoneNumberFormSchema>;

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .min(1)
    .refine((val) => !/^[\d\s]+$/.test(val.trim()), 'Cannot contain only numbers'),
  location: z
    .string()
    .refine((val) => !val || !/^[\d\s]+$/.test(val.trim()), 'Cannot contain only numbers'),
  bio: z.string().max(500).default(''),
  profileIcon: z.coerce.number().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return urlPattern.test(val);
      },
      {
        message: 'Please enter a valid URL',
      }
    ),
  secondaryEmail: z.string().email().optional(),
});

export type ProfileFormType = z.infer<typeof profileFormSchema>;

const profileUpdateSchema = z.union([
  secondaryEmailFormSchema,
  phoneNumberFormSchema,
  profileFormSchema,
]);

export type UpdateProfilePayload = z.infer<typeof profileUpdateSchema>;
