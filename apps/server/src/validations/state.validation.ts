import { z } from 'zod';

export const stateByIdSchema = z.object({
  params: z.object({
    stateId: z.string(),
  }),
});

export const stateByCountryIdSchema = z.object({
  params: z.object({
    countryId: z.string(),
  }),
});
