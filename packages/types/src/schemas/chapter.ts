import { z } from 'zod';
import { baseSchema } from './common.js';

export const chapterSchema = baseSchema.extend({
  type: z.literal('chapter'),
  lessons: z.array(z.string()).optional(),
});

export type ChapterSchema = z.infer<typeof chapterSchema>;
