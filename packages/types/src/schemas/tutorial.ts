import { z } from 'zod';
import { webcontainerSchema } from './common.js';

export const tutorialSchema = webcontainerSchema.extend({
  type: z.literal('tutorial'),
  logoLink: z.string().optional(),
});

export type TutorialSchema = z.infer<typeof tutorialSchema>;
