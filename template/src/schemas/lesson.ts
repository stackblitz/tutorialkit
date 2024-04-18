import { z } from 'astro:content';
import { baseSchema } from './common';

export const lessonSchema = baseSchema.extend({
  type: z.literal('lesson'),
  focus: z.string().optional(),
  hideFileTree: z.boolean().optional(),
  files: z.array(z.string()).optional(),
});

export type LessonSchema = z.infer<typeof lessonSchema>;
