import { z } from 'zod';

export const i18nSchema = z.object({
  /**
   * Template on how to format a part. Variables: ${index} and ${title}.
   *
   * @default 'Part ${index}: ${title}'
   */
  partTemplate: z.string().optional().describe('Template on how to format a part. Variables: ${index} and ${title}.'),

  /**
   * Text of the edit page link.
   *
   * @default 'Edit this page'
   */
  editPageText: z.string().optional().describe('Text of the edit page link.'),

  /**
   * Text of the WebContainer link.
   *
   * @default 'Powered by WebContainers'
   */
  webcontainerLinkText: z.string().optional().describe('Text of the WebContainer link.'),

  /**
   * Text shown on the call to action button to start webcontainer when boot was blocked
   * due to memory restrictions.
   *
   * @default 'Start WebContainer'
   */
  startWebContainerText: z
    .string()
    .optional()
    .describe(
      'Text shown on the call to action button to start webcontainer when boot was blocked due to memory restrictions.',
    ),

  /**
   * Text shown in the preview section when there are no steps to run and no preview to show.
   *
   * @default 'No preview to run nor steps to show'
   */
  noPreviewNorStepsText: z
    .string()
    .optional()
    .describe('Text shown in the preview section when there are no steps to run and no preview to show.'),

  /**
   * Text shown on top of the file tree.
   *
   * @default 'Files'
   */
  filesTitleText: z.string().optional().describe('Text shown on top of the file tree.'),

  /**
   * Text shown on file tree's context menu's file creation button.
   *
   * @default 'Create file'
   */
  fileTreeCreateFileText: z
    .string()
    .optional()
    .describe("Text shown on file tree's context menu's file creation button."),

  /**
   * Text shown on file tree's context menu's folder creation button.
   *
   * @default 'Create folder'
   */
  fileTreeCreateFolderText: z
    .string()
    .optional()
    .describe("Text shown on file tree's context menu's folder creation button."),

  /**
   * Text shown on top of the steps section.
   *
   * @default 'Preparing Environment'
   */
  prepareEnvironmentTitleText: z.string().optional().describe('Text shown on top of the steps section.'),

  /**
   * Text shown on top of the preview section when `previews[_].title` is not configured.
   *
   * @default 'Preview'
   */
  defaultPreviewTitleText: z.string().optional().describe('Text shown on top of the preview section.'),

  /**
   * Title attribute for the preview reload button.
   *
   * @default 'Reload Preview'
   */
  reloadPreviewTitle: z.string().optional().describe('Title attribute for the preview reload button.'),

  /**
   * Text for the toggle terminal button.
   *
   * @default 'Toggle Terminal'
   */
  toggleTerminalButtonText: z.string().optional().describe('Text for the toggle terminal button.'),

  /**
   * Text for the solve button.
   *
   * @default 'Solve'
   */
  solveButtonText: z.string().optional().describe('Text for the solve button.'),

  /**
   * Text for the reset button.
   *
   * @default 'Reset'
   */
  resetButtonText: z.string().optional().describe('Text for the reset button.'),
});

export type I18nSchema = z.infer<typeof i18nSchema>;
