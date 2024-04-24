import { z } from 'astro:content';
import { commandSchema } from './common';

export const tutorialSchema = commandSchema.extend({
  type: z.literal('tutorial'),
});

export type TutorialSchema = z.infer<typeof tutorialSchema>;
