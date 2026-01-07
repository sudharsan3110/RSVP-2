import z from 'zod';
import { PAGINATION_ORDER } from './event.validation';

export const cityParamsSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const cityFilterSchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().default(10),
    search: z.string().optional(),
  }),
});
