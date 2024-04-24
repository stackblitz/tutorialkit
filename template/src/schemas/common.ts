import { z } from 'astro:content';

export const commandSchema = z.object({
  mainCommand: z.string().optional(),
  prepareCommands: z.array(z.string()).optional(),
});

export const baseSchema = commandSchema.extend({
  title: z.string(),
  slug: z.optional(z.string()),
});

export type BaseSchema = z.infer<typeof baseSchema>;
