import { z } from 'zod';
import { baseSchema } from './common.js';

export const lessonSchema = baseSchema.extend({
  type: z.literal('lesson'),
  scope: z.string().optional().describe('A prefix that all file paths must match to be visible in the file tree.'),
  hideRoot: z
    .boolean()
    .optional()
    .describe('If set to false, `/` is shown at the top of the file tree. Defaults to true.'),
});

export type LessonSchema = z.infer<typeof lessonSchema>;
