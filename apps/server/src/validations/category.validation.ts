import z from 'zod';

export const categoryParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
