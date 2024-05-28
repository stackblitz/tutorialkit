import { z } from 'zod';
import { baseSchema } from './common.js';

export const chapterSchema = baseSchema.extend({
  type: z.literal('chapter'),
});

export type ChapterSchema = z.infer<typeof chapterSchema>;
