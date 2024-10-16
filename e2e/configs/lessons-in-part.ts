import tutorialkit from '@tutorialkit/astro';
import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: { enabled: false },
  server: { port: 4332 },
  outDir: './dist-lessons-in-part',
  integrations: [tutorialkit()],
  srcDir: './src-custom/lessons-in-part',
});
