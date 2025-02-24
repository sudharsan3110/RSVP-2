import { z } from 'zod';

export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().trim().optional(),
  sortBy: z.string().optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PaginationParams = z.infer<typeof paginationParamsSchema>;
