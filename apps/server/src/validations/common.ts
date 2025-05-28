import { z } from 'zod';

export const emptySchema = z.object({});

export const uuidSchema = z.string().uuid();
