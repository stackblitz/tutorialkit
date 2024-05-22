import { z } from 'astro:content';
import { baseSchema } from './common';

export const chapterSchema = baseSchema.extend({
  type: z.literal('chapter'),
});

export type ChapterSchema = z.infer<typeof chapterSchema>;
