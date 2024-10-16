import tutorialkit from '@tutorialkit/astro';
import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: { enabled: false },
  server: { port: 4331 },
  outDir: './dist-lessons-in-root',
  integrations: [tutorialkit()],
  srcDir: './src-custom/lessons-in-root',
});
