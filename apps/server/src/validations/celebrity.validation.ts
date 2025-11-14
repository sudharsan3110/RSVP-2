import z from 'zod';

export const eventIdParamsSchema = z.object({
	params: z.object({
		eventId: z.string().uuid(),
	}),
});

export const addCelebritySchema = z.object({
	params: z.object({
		eventId: z.string().uuid(),
	}),
	body: z.object({
		userId: z.string().uuid(),
	}),
});

export const removeCelebrityParamsSchema = z.object({
	params: z.object({
		eventId: z.string().uuid(),
		celebrityId: z.string().uuid(),
	}),
});

