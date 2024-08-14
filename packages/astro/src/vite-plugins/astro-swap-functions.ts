/**
 * A plugin for importing Astro's private 'transitions/swap-functions.js' module.
 * This is temporary solution and can break at any time when end-user's update their `astro` version.
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import type { VitePlugin } from '../types.js';

const require = createRequire(import.meta.url);
const astroDist = resolve(require.resolve('astro/package.json'), '..');
const swapFunctionEntry = resolve(astroDist, 'dist/transitions/swap-functions.js');

const virtualModuleId = 'tutorialkit:astro-swap-functions';
const resolvedId = `\0${virtualModuleId}`;

export function astroSwapFunctions(): VitePlugin {
  return {
    name: 'tutorialkit-astro-swap-functions-plugin',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedId;
      }

      return undefined;
    },

    async load(id) {
      if (id === resolvedId) {
        return await readFile(swapFunctionEntry, 'utf8');
      }

      return undefined;
    },
  };
}
