import { z } from 'zod';

export const i18nSchema = z.object({
  /** Prefix preceding the link to navigate to the next lesson */
  nextLessonPrefix: z.string().optional(),

  /** Template on how to format a part. Variables: ${index} and ${title} */
  partTemplate: z.string().optional(),

  /** Text shown when there are no previews or steps to show */
  startWebContainerText: z.string().optional(),

  /** Text shown on the call to action button to start webcontainer when boot was blocked due to memory restrictions  */
  noPreviewNorStepsText: z.string().optional(),
});

export type I18nSchema = z.infer<typeof i18nSchema>;
