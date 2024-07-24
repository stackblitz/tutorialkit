import type { z } from 'zod';
import { chapterSchema } from './chapter.js';
import { lessonSchema } from './lesson.js';
import { partSchema } from './part.js';
import { tutorialSchema } from './tutorial.js';

export const contentSchema = tutorialSchema
  .strict()
  .or(partSchema.strict())
  .or(chapterSchema.strict())
  .or(lessonSchema.strict());

export type ContentSchema = z.infer<typeof contentSchema>;
