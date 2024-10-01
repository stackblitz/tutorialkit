import { z } from 'zod';

export const metaTagsSchema = z.object({
  image: z
    .string()
    .optional()
    /**
     * Ideally we would want to use `image` from:
     * https://docs.astro.build/en/guides/images/#images-in-content-collections .
     */
    .describe('A relative path to an image that lives in the public folder to show on social previews.'),
  description: z.string().optional().describe('A description for metadata'),
  title: z.string().optional().describe('A title to use specifically for metadata'),
});

export type MetaTagsSchema = z.infer<typeof metaTagsSchema>;
