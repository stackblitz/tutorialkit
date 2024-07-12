import { z } from 'zod';

export const i18nSchema = z.object({
  /**
   * Template on how to format a part. Variables: ${index} and ${title}.
   *
   * @default 'Part ${index}: ${title}'
   */
  partTemplate: z.string().optional(),

  /**
   * Text of the edit page link.
   *
   * @default 'Edit this page'
   */
  editPageText: z.string().optional(),

  /**
   * Text shown when there are no previews or steps to show in the prepare environment section.
   *
   * @default 'Start WebContainer'
   */
  startWebContainerText: z.string().optional(),

  /**
   * Text shown on the call to action button to start webcontainer when boot was blocked
   * due to memory restrictions.
   *
   * @default 'No preview to run nor steps to show'
   */
  noPreviewNorStepsText: z.string().optional(),
});

export type I18nSchema = z.infer<typeof i18nSchema>;
