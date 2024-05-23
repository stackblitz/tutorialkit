import { z } from 'astro:content';
import { webcontainerSchema } from './common';

export const tutorialSchema = webcontainerSchema.extend({
  type: z.literal('tutorial'),
});

export type TutorialSchema = z.infer<typeof tutorialSchema>;
