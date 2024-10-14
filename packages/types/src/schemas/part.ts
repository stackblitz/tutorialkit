import { z } from 'zod';
import { baseSchema } from './common.js';

export const partSchema = baseSchema.extend({
  type: z.literal('part'),
  chapters: z
    .array(z.string())
    .optional()
    .describe(
      'The list of chapters in this part. The order of this array defines the order of the chapters. If not specified a folder-based numbering system is used instead.',
    ),
  lessons: z
    .array(z.string())
    .optional()
    .describe(
      'The list of lessons in this part. The order of this array defines the order of the lessons. If not specified a folder-based numbering system is used instead.',
    ),
});

export type PartSchema = z.infer<typeof partSchema>;
