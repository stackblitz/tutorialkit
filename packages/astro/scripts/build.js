import assert from 'node:assert';
import { existsSync, rmSync, copyFileSync } from 'node:fs';
import { cp, rm } from 'node:fs/promises';
import path from 'node:path';
import chokidar from 'chokidar';
import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { execa } from 'execa';

const isWatch = process.argv.includes('--watch');

if (!isWatch) {
  // clean dist
  await rm('dist', { recursive: true, force: true });
}

await generateTypes();
await buildJS();
await copyDefaultFolder();

async function generateTypes() {
  // only do typechecking and emit the type declarations with tsc
  const args = [
    '--emitDeclarationOnly',
    '--project',
    './tsconfig.build.json',
    isWatch && '--watch',
    '--preserveWatchOutput',
  ].filter((s) => !!s);

  const promise = execa('tsc', args, { stdio: 'inherit', preferLocal: true });

  if (!isWatch && existsSync('./dist/default')) {
    await promise;
    assert.fail('TypeScript transpiled the default folder, it means that the tsconfig has an issue');
  }
}

async function buildJS() {
  const context = await esbuild.context({
    entryPoints: ['src/index.ts'],
    bundle: true,
    tsconfig: './tsconfig.build.json',
    platform: 'node',
    format: 'esm',
    outdir: 'dist',
    define: {
      'process.env.TUTORIALKIT_DEV': JSON.stringify(process.env.TUTORIALKIT_DEV ?? null),
      'process.env.TUTORIALKIT_VITE_INSPECT': JSON.stringify(process.env.TUTORIALKIT_VITE_INSPECT ?? null),
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

async function copyDefaultFolder() {
  const src = './src/default';
  const dist = './dist/default';
  await rm(dist, { recursive: true, force: true });

  // copy default folder unmodified, without test files
  await cp(src, dist, { recursive: true, filter });

  if (isWatch) {
    chokidar.watch(src).on('all', (event, filePath, stats) => {
      if (stats?.isDirectory() !== true && filter(filePath)) {
        const target = path.join(dist, path.relative(src, filePath));

        if (event === 'unlink') {
          rmSync(target);
        } else {
          copyFileSync(filePath, target);
        }
      }
    });
  }

  function filter(filename) {
    return !filename.endsWith('.spec.ts') && !filename.includes('__snapshots__');
  }
}
