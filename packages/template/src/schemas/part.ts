import { z } from 'astro:content';
import { baseSchema } from './common';

export const partSchema = baseSchema.extend({
  type: z.literal('part'),
});

export type PartSchema = z.infer<typeof partSchema>;
