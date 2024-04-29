import { z } from 'astro:content';

export const command = z.union([
  // a single string, the command to run
  z.string(),
  // an array of two strings, the command followed by a humand readable name describing the command
  z.tuple([z.string(), z.string()]),
  z.strictObject({
    command: z.string(),
    title: z.string(),
  }),
]);

export const commandSchema = z.object({
  mainCommand: command.optional(),
  prepareCommands: command.array().optional(),
});

export const baseSchema = commandSchema.extend({
  title: z.string(),
  slug: z.optional(z.string()),
});

export type BaseSchema = z.infer<typeof baseSchema>;
