import tutorialkit from '@tutorialkit/astro';
import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: { enabled: false },
  server: { port: 4330 },
  outDir: './dist-override-components',
  integrations: [
    tutorialkit({
      components: {
        Dialog: './src/components/Dialog.tsx',
        TopBar: './src/components/TopBar.astro',
        HeadTags: './src/components/CustomHeadTags.astro',
      },
    }),
  ],
});
