import { z } from 'astro:content';

export const commandSchema = z.union([
  // a single string, the command to run
  z.string(),

  // a tuple of two strings, the command followed by a title
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

export const previewSchema = z.union([
  // a single number, the port for the preview
  z.number(),

  // a tuple, the port followed by a title
  z.tuple([z.number(), z.string()]),

  z.strictObject({
    port: z.number(),
    title: z.string(),
  }),
]);

export type PreviewSchema = z.infer<typeof previewSchema>;

export const webcontainerSchema = commandsSchema.extend({
  previews: previewSchema.array().optional(),
  autoReload: z.boolean().optional(),
});

export const baseSchema = webcontainerSchema.extend({
  title: z.string(),
  slug: z.optional(z.string()),
});

export type BaseSchema = z.infer<typeof baseSchema>;
