import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import tutorialkit from '@tutorialkit/astro';
import { defineConfig } from 'astro/config';

const require = createRequire(import.meta.url);
const astroDist = resolve(require.resolve('astro/package.json'), '..');
const swapFunctionEntry = resolve(astroDist, 'dist/transitions/swap-functions.js');

export default defineConfig({
  devToolbar: { enabled: false },
  server: { port: 4329 },
  integrations: [tutorialkit()],

  vite: {
    resolve: {
      alias: {
        // work-around for https://github.com/stackblitz/tutorialkit/pull/238
        'node_modules/astro/dist/transitions/swap-functions': swapFunctionEntry,
      },
    },
  },
});
