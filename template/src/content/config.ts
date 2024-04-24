import { chapterSchema, lessonSchema, partSchema, tutorialSchema } from '@schemas';
import { defineCollection } from 'astro:content';

const tutorial = defineCollection({
  type: 'content',
  schema: tutorialSchema.or(partSchema).or(chapterSchema).or(lessonSchema),
});

export const collections = { tutorial };
