import { z } from 'zod';
import { baseSchema } from './common.js';

export const lessonSchema = baseSchema.extend({
  type: z.literal('lesson'),
  focus: z.string().optional(),
  scope: z.string().optional(),
  fileTree: z.boolean().optional(),
  hideRoot: z.boolean().optional(),
});

export type LessonSchema = z.infer<typeof lessonSchema>;
