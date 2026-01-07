import { z } from 'zod';
import { disposableEmailValidator } from './disposible-mail';
import { parsePhoneNumberFromString, CountryCode, getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';
import { PhoneNumberOption } from '../phone-utils';

const defaultPhoneNumberOptions: PhoneNumberOption[] = [
  {
    value: '+91',
    label: 'India',
    icon: '🇮🇳',
    countryCode: 'IN',
  },
];

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

export const phoneNumberFormSchema = (
  selectedCountry: string = '+91',
  phoneNumberOptions: PhoneNumberOption[] = defaultPhoneNumberOptions
) => {
  const countryMap: Record<string, CountryCode> = {};
  phoneNumberOptions.forEach((opt) => {
    countryMap[opt.value.replace('+', '')] = opt.countryCode;
  });

  const selectedCountryCode = selectedCountry.replace('+', '');
  const defaultCountryCode: CountryCode = countryMap[selectedCountryCode] ?? 'IN';

  return z.object({
    contact: z
      .string()
      .transform((val, ctx) => {
        const cleanInput = val.replace(/[^\d+\s\-()]/g, '').trim();
        if (!cleanInput) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Phone number is required',
          });
          return z.NEVER;
        }

        const parsed = parsePhoneNumberFromString(cleanInput, {
          defaultCountry: defaultCountryCode,
          extract: false,
        });

        if (!parsed || !parsed.isValid() || !parsed.isPossible()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Please enter a valid phone number for ${defaultCountryCode}`,
          });
          return z.NEVER;
        }

        const digitsOnly = parsed.nationalNumber;

        if (/^(\d)\1{5,}$/.test(digitsOnly)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Phone number cannot have all repeating digits',
          });
          return z.NEVER;
        }

        if (new Set(digitsOnly).size < 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Phone number must have at least 3 unique digits',
          });
          return z.NEVER;
        }

        const isSequential = (s: string) => {
          if (s.length < 6) return false;
          let asc = true,
            desc = true;
          for (let i = 1; i < s.length; i++) {
            if (+s[i] !== +s[i - 1] + 1) asc = false;
            if (+s[i] !== +s[i - 1] - 1) desc = false;
          }
          return asc || desc;
        };

        if (isSequential(digitsOnly)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Phone number cannot be sequential digits',
          });
          return z.NEVER;
        }

        try {
          const example = getExampleNumber(defaultCountryCode, examples);
          if (example && parsed.nationalNumber.length !== example.nationalNumber.length) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Phone number must be ${example.nationalNumber.length} digits for ${defaultCountryCode}`,
            });
            return z.NEVER;
          }
        } catch (e) {
          throw new Error(`Failed to get example number for ${defaultCountryCode}`);
        }

        return parsed.format('E.164');
      })
      .optional(),
  });
};

export type PhoneNumberFormType = z.infer<ReturnType<typeof phoneNumberFormSchema>>;
const xProfileRegex = /^[A-Za-z0-9_]{1,15}$/;
const instagramProfileRegex = /^(?!.*\.\.)(?!^\.)[A-Za-z0-9_.]{2,30}(?<!\.)$/;

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1)
    .refine((val) => !/^[\d\s]+$/.test(val.trim()), 'Cannot contain only numbers'),
  location: z
    .string()
    .refine((val) => !val || !/^[\d\s]+$/.test(val.trim()), 'Cannot contain only numbers'),
  bio: z.string().max(500).default(''),
  profileIcon: z.coerce.number().optional(),
  twitter: z
    .string()
    .optional()
    .refine((val) => !val || xProfileRegex.test(val), {
      message: 'Invalid X username',
    }),
  instagram: z
    .string()
    .optional()
    .refine((val) => !val || instagramProfileRegex.test(val), {
      message: 'Invalid Instagram username',
    }),
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

const defaultPhoneNumberSchema = phoneNumberFormSchema('+91', defaultPhoneNumberOptions);

const profileUpdateSchema = z.union([
  secondaryEmailFormSchema,
  defaultPhoneNumberSchema,
  profileFormSchema,
]);

export type UpdateProfilePayload = z.infer<typeof profileUpdateSchema>;
