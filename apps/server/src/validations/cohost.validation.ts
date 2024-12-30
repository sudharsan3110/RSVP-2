import z from 'zod';

export const addCohostSchema = z.object({
  eventId: z.string().max(256),
  email: z.string().email(),
  role: z.enum(['Manager', 'ReadOnly', 'Celebrity']),
});
