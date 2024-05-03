import { z } from 'astro:content';

export const commandSchema = z.union([
  // a single string, the command to run
  z.string(),

  // an array of two strings, the command followed by a title
  z.tuple([z.string(), z.string()]),

  z.strictObject({
    command: z.string(),
    title: z.string(),
  }),
]);

export type CommandSchema = z.infer<typeof commandSchema>;

export const commandsSchema = z.object({
  mainCommand: commandSchema.optional(),
  prepareCommands: commandSchema.array().optional(),
});

export type CommandsSchema = z.infer<typeof commandsSchema>;

export const webcontainerSchema = commandsSchema.extend({
  previewPort: z.number().optional(),
  autoReload: z.boolean().optional(),
});

export const baseSchema = webcontainerSchema.extend({
  title: z.string(),
  slug: z.optional(z.string()),
});

export type BaseSchema = z.infer<typeof baseSchema>;
