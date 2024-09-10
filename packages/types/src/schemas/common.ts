import { z } from 'zod';
import { i18nSchema } from './i18n.js';

export const commandSchema = z.union([
  // a single string, the command to run
  z.string(),

  // a tuple of two strings, the command followed by a title
  z.tuple([z.string(), z.string()]),

  z.strictObject({
    command: z.string().describe('Command to execute in WebContainer.'),
    title: z.string().describe('Title to show for this step in the Prepare Environment section.'),
  }),
]);

export type CommandSchema = z.infer<typeof commandSchema>;

export const commandsSchema = z.object({
  mainCommand: commandSchema.optional().describe('The last command to be executed. Typically a dev server.'),
  prepareCommands: commandSchema
    .array()
    .optional()
    .describe(
      'List of commands to be executed to prepare the environment in WebContainer. Each command executed and its status will be shown in the Prepare Environment section.',
    ),
});

export type CommandsSchema = z.infer<typeof commandsSchema>;

export const previewSchema = z.union([
  // `false` if you want to disable the preview entirely
  z.boolean(),

  z
    .union([
      // a single number, the port for the preview
      z.number(),

      // a string, the port and pathname
      z.string(),

      // a tuple, the port followed by a title and optional pathname
      z.tuple([z.number(), z.string()]),
      z.tuple([z.number(), z.string(), z.string()]),

      z.strictObject({
        port: z.number().describe('Port number of the preview.'),
        title: z.string().describe('Title of the preview.'),
        pathname: z.string().optional().describe('Pathname of the preview URL.'),
      }),
    ])
    .array(),
]);

export type PreviewSchema = z.infer<typeof previewSchema>;

const panelTypeSchema = z
  .union([z.literal('output'), z.literal('terminal')])
  .describe(`The type of the terminal which can either be 'output' or 'terminal'.`);

const allowRedirectsSchema = z
  .boolean()
  .optional()
  .describe("Set to `true` if you want to enable output redirects in the terminal. It's disabled by default.");

const allowCommandsSchema = z
  .array(z.string())
  .optional()
  .describe('List of command that are allowed in the terminal, if not provided, all commands are allowed.');

export const terminalSchema = z.union([
  // `false` if you want to disable the terminal entirely
  z.boolean(),

  z.strictObject({
    open: z.boolean().optional().describe('Defines if terminal should be open by default'),

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
            panelTypeSchema,

            // or a tuple with the type and the title of the panel
            z.tuple([
              // the type of the panel
              panelTypeSchema,

              // the title of the panel which is shown in the tab
              z.string(),
            ]),

            // or an object defining the panel
            z.strictObject({
              // the type of the panel
              type: panelTypeSchema,

              // an id linking the terminal of multiple lessons together
              id: z
                .string()
                .optional()
                .describe(
                  'An id linking the terminal of multiple lessons together so that its state is preserved between lessons.',
                ),

              // the title of the panel which is shown in the tab
              title: z.string().optional().describe('The title of the panel which is shown in the tab.'),

              // `true` if you want to enable output redirects in the terminal, disabled by default
              allowRedirects: allowRedirectsSchema,

              // list of command that are allowed in the terminal, if not provided, all commands are allowed
              allowCommands: allowCommandsSchema,
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
    activePanel: z.number().gte(0).optional().describe('Defines which panel should be visible by default.'),

    // `true` if you want to enable output redirects in the terminal, disabled by default
    allowRedirects: allowRedirectsSchema,

    // list of command that are allowed in the terminal, if not provided, all commands are allowed
    allowCommands: allowCommandsSchema,
  }),
]);

export const editorSchema = z.union([
  // can either be completely removed by setting it to `false`
  z.boolean().optional(),

  z.strictObject({
    fileTree: z
      .union([
        // or you can only remove the file tree
        z.boolean(),

        // or configure file tree with options
        z.strictObject({
          allowEdits: z
            .boolean()
            .describe(
              'Allow file tree’s items to be edited by right clicking them. Supports file and folder creation.',
            ),
        }),
      ])
      .optional(),
  }),
]);

export type TerminalPanelType = z.infer<typeof panelTypeSchema>;
export type TerminalSchema = z.infer<typeof terminalSchema>;
export type EditorSchema = z.infer<typeof editorSchema>;

export const webcontainerSchema = commandsSchema.extend({
  previews: previewSchema
    .optional()
    .describe(
      'Configure which ports should be used for the previews allowing you to align the behavior with your demo application’s dev server setup. If not specified, the lowest port will be used.',
    ),
  autoReload: z
    .boolean()
    .optional()
    .describe(
      'Navigating to a lesson that specifies autoReload will always reload the preview. This is typically only needed if your server does not support HMR.',
    ),
  template: z
    .string()
    .optional()
    .describe(
      'Specifies which folder from the `src/templates/` directory should be used as the basis for the code. See the "Code templates" guide for a detailed explainer.',
    ),
  terminal: terminalSchema
    .optional()
    .describe(
      'Configures one or more terminals. TutorialKit provides two types of terminals: read-only, called output, and interactive, called terminal.',
    ),
  focus: z
    .string()
    .optional()
    .describe('Defines which file should be opened in the code editor by default when lesson loads.'),
  editor: editorSchema
    .optional()
    .describe(
      'Configure whether or not the editor should be rendered. File tree can be configured by proving an object with fileTree option.',
    ),
  i18n: i18nSchema
    .optional()
    .describe('Lets you define alternative texts used in the UI. This is useful for localization.'),
  editPageLink: z
    .union([
      // pattern for creating the URL
      z.string(),

      // `false` for disabling the edit link
      z.boolean(),
    ])
    .optional()
    .describe(
      'Display a link in lesson for editing the page content. The value is a URL pattern where `${path}` is replaced with the lesson’s location relative to `src/content/tutorial`.',
    ),
  openInStackBlitz: z
    .union([
      // `false` for disabling the link
      z.boolean(),

      z.strictObject({
        projectTitle: z.string().optional(),
        projectDescription: z.string().optional(),
        projectTemplate: z
          .union([
            z.literal('html'),
            z.literal('node'),
            z.literal('angular-cli'),
            z.literal('create-react-app'),
            z.literal('javascript'),
            z.literal('polymer'),
            z.literal('typescript'),
            z.literal('vue'),
          ])
          .optional(),
      }),
    ])
    .optional()
    .describe('Display a link for opening current lesson in StackBlitz.'),
});

export const baseSchema = webcontainerSchema.extend({
  title: z.string().describe('The title of the part, chapter, or lesson.'),
  slug: z
    .string()
    .optional()
    .describe(
      'Customize the URL segment of this part, chapter or lesson. The full URL path is `/:partSlug/:chapterSlug/:lessonSlug`.',
    ),
});

export type BaseSchema = z.infer<typeof baseSchema>;
