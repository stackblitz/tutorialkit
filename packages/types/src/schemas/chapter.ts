import { z } from 'zod';
import { baseSchema } from './common.js';

export const chapterSchema = baseSchema.extend({
  type: z.literal('chapter'),
  lessons: z
    .array(z.string())
    .optional()
    .describe(
      'The list of lessons in this chapter. The order of the array defines the order of the lessons. If not specified a folder-based numbering system is used instead.',
    ),
});

export type ChapterSchema = z.infer<typeof chapterSchema>;
