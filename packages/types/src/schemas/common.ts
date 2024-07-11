import { z } from 'zod';
import { i18nSchema } from './i18n.js';

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
  // `false` if you want to disable the preview entirely
  z.boolean(),

  z
    .union([
      // a single number, the port for the preview
      z.number(),

      // a tuple, the port followed by a title
      z.tuple([z.number(), z.string()]),

      z.strictObject({
        port: z.number(),
        title: z.string(),
      }),
    ])
    .array(),
]);

export type PreviewSchema = z.infer<typeof previewSchema>;

const panelType = z.union([z.literal('output'), z.literal('terminal')]);

export const terminalSchema = z.union([
  // `false` if you want to disable the terminal entirely
  z.boolean(),

  z.strictObject({
    panels: z.union([
      // either literally just `output`
      z.literal('output'),

      // or literally `terminal`
      z.literal('terminal'),

      /**
       * Or an array of `output` and/or `terminal` literals and/or tuples where the first value is either `output` or
       * `terminal`, and the second being the title and/or panel config objects.
       */
      z
        .array(
          z.union([
            // the type of the panel
            panelType,

            // or a tuple with the type and the title of the panel
            z.tuple([
              // the type of the panel
              panelType,

              // the title of the panel which is shown in the tab
              z.string(),
            ]),

            // or an object defining the panel
            z.strictObject({
              // the type of the panel
              type: panelType,

              // an id linking the terminal of multiple lessons together
              id: z.string().optional(),

              // the title of the panel which is shown in the tab
              title: z.string().optional(),

              // `true` if you want to enable output redirects in the terminal, disabled by default
              allowRedirects: z.boolean().optional(),

              // list of command that are allowed in the terminal, if not provided, all commands are allowed
              allowCommands: z.array(z.string()).optional(),
            }),
          ]),
        )
        .refine(
          (arg) => {
            let output = 0;

            for (const value of arg) {
              if (
                value === 'output' ||
                (Array.isArray(value) && value[0] === 'output') ||
                (typeof value === 'object' && (value as any).type === 'output')
              ) {
                output++;
              }

              if (output > 1) {
                return false;
              }
            }

            return true;
          },
          {
            message: 'Only a single output panel can be defined.',
          },
        ),
    ]),
    activePanel: z.number().gte(0).optional(),

    // `true` if you want to enable output redirects in the terminal, disabled by default
    allowRedirects: z.boolean().optional(),

    // list of command that are allowed in the terminal, if not provided, all commands are allowed
    allowCommands: z.array(z.string()).optional(),
  }),
]);

export type TerminalPanelType = z.infer<typeof panelType>;
export type TerminalSchema = z.infer<typeof terminalSchema>;

export const webcontainerSchema = commandsSchema.extend({
  previews: previewSchema.optional(),
  autoReload: z.boolean().optional(),
  template: z.string().optional(),
  terminal: terminalSchema.optional(),
  focus: z.string().optional(),
  editor: z.union([
    // can either be completely removed by setting it to `false`
    z.boolean().optional(),

    // or you can only remove the file tree
    z.strictObject({
      fileTree: z.boolean().optional(),
    }),
  ]),
  i18n: i18nSchema.optional(),
});

export const editPageLinkSchema = z.union([
  // pattern for creating the URL
  z.string(),

  // `false` for disabling the edit link
  z.boolean(),
]);

export const baseSchema = webcontainerSchema.extend({
  title: z.string(),
  slug: z.string().optional(),
  editPageLink: editPageLinkSchema.optional(),
});

export type BaseSchema = z.infer<typeof baseSchema>;
