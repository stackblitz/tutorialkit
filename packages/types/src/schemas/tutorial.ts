import { z } from 'zod';
import { webcontainerSchema, editPageLinkSchema } from './common.js';

export const tutorialSchema = webcontainerSchema.extend({
  type: z.literal('tutorial'),
  logoLink: z.string().optional(),
  editPageLink: editPageLinkSchema.optional(),
  parts: z.array(z.string()).optional(),
});

export type TutorialSchema = z.infer<typeof tutorialSchema>;
