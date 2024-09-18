import fs from 'node:fs';
import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { distFolder, outDir } from './_constants.js';

const isWatch = process.argv.includes('--watch');

if (!isWatch) {
  fs.rmSync(distFolder, { recursive: true, force: true });
}

await buildJS();

async function buildJS() {
  const context = await esbuild.context({
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

  if (isWatch) {
    context.watch();
  } else {
    await context.rebuild();
    await context.dispose();
  }
}
