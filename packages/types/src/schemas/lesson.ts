import { z } from 'zod';
import { baseSchema } from './common.js';

export const lessonSchema = baseSchema.extend({
  type: z.literal('lesson'),
  focus: z.string().optional(),
  scope: z.string().optional(),
  editor: z.union([
    // can either be completely removed by setting it to `false`
    z.boolean().optional(),

    // or you can only remove the file tree
    z.strictObject({
      fileTree: z.boolean().optional()
    }),
  ]),
  hideRoot: z.boolean().optional(),
});

export type LessonSchema = z.infer<typeof lessonSchema>;
