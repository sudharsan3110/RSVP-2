import { z } from 'zod';

export const communication = z.object({
  content: z.string(),
  plaintextContent: z.string(),
});

export type CommunicationForm = z.infer<typeof communication>;
