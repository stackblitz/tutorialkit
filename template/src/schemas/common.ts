import { z } from 'astro:content';

export const baseSchema = z.object({
  title: z.string(),
  slug: z.optional(z.string()),
});

export type BaseSchema = z.infer<typeof baseSchema>;
