import { z } from 'zod';
import { webcontainerSchema } from './common.js';

export const tutorialSchema = webcontainerSchema.extend({
  type: z.literal('tutorial'),
  logoLink: z.string().optional(),
  parts: z
    .array(z.string())
    .optional()
    .describe(
      'The list of parts in this tutorial. The order of this array defines the order of the parts. If not specified a folder-based numbering system is used instead.',
    ),
  lessons: z
    .array(z.string())
    .optional()
    .describe(
      'The list of lessons in this tutorial. The order of this array defines the order of the lessons. If not specified a folder-based numbering system is used instead.',
    ),
});

export type TutorialSchema = z.infer<typeof tutorialSchema>;
