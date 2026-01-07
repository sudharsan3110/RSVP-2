import z from 'zod';

export const addCohostSchema = z.object({
  body: z.object({
    eventId: z.string().max(256),
    email: z.string().email(),
    role: z.enum(['Manager', 'ReadOnly', 'Celebrity']),
  }),
});

export const eventParamsSchema = z.object({
  params: z.object({
    eventId: z.string().uuid(),
  }),
});

export const removeCohostSchema = z.object({
  params: z.object({
    eventId: z.string().uuid(),
    userId: z.string().uuid(),
  }),
});
