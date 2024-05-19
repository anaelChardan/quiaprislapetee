import * as z from 'zod';

const commonResponseSchema = z.object({ reason: z.string() });

export const standardResponseSchema = {
  400: commonResponseSchema,
  401: commonResponseSchema,
  500: commonResponseSchema,
};
