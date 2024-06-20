import { z } from 'zod';
import { baseSchema } from './common.js';

export const partSchema = baseSchema.extend({
  type: z.literal('part'),
  chapters: z.array(z.string()).optional(),
});

export type PartSchema = z.infer<typeof partSchema>;
