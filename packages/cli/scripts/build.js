import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import fs from 'node:fs';
import { distFolder, outDir } from './_constants.js';
import { success } from './logger.js';

fs.rmSync(distFolder, { recursive: true, force: true });

esbuild.build({
  entryPoints: ['src/index.ts'],
  minify: false,
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outdir: outDir,
  define: {
    'process.env.TUTORIALKIT_TEMPLATE_PATH': JSON.stringify(process.env.TUTORIALKIT_TEMPLATE_PATH ?? null),
  },
  plugins: [nodeExternalsPlugin()],
});

success('Build finished');
