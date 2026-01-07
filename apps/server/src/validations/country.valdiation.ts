import z from 'zod';

export const countryParamsSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
