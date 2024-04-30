import { z } from 'astro:content';

export const command = z.union([
  // a single string, the command to run
  z.string(),
  // an array of two strings, the command followed by a title
  z.tuple([z.string(), z.string()]),
  z.strictObject({
    command: z.string(),
    title: z.string(),
  }),
]);

export const webcontainerSchema = z.object({
  mainCommand: command.optional(),
  prepareCommands: command.array().optional(),
  previewPort: z.number().optional(),
  previewUrl: z.number().optional(),
});

export const baseSchema = webcontainerSchema.extend({
  title: z.string(),
  slug: z.optional(z.string()),
});

export type BaseSchema = z.infer<typeof baseSchema>;
