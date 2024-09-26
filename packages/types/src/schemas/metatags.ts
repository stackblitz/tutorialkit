import { z } from 'zod';

export const metaTagsSchema = z.object({
  image: z
    .string()
    .optional()
    /**
     * Ideally we would have want to use image from:
     * https://docs.astro.build/en/guides/images/#images-in-content-collections .
     */
    .describe('An image to show on social previews, should point to the public folder: "/foobar.png"'),
  description: z.string().optional().describe('A description for metadata'),
  title: z.string().optional().describe('A title to use specifically for metadata'),
});

export type MetaTagsSchema = z.infer<typeof metaTagsSchema>;
