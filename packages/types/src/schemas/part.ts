import { z } from 'zod';
import { baseSchema } from './common';

export const partSchema = baseSchema.extend({
  type: z.literal('part'),
});

export type PartSchema = z.infer<typeof partSchema>;
