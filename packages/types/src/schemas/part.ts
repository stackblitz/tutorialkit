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
  terminal: z
    .boolean()
    .optional()
    .describe('Controls whether the terminal is visible for this part. Defaults to true.'),
});

export type PartSchema = z.infer<typeof partSchema>;
