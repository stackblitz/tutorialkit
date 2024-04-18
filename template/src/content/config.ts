import { chapterSchema, lessonSchema, partSchema } from '@schemas';
import { defineCollection } from 'astro:content';

const tutorial = defineCollection({
  type: 'content',
  schema: partSchema.or(lessonSchema).or(chapterSchema),
});

export const collections = { tutorial };
