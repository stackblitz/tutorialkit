import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { cp, rm } from 'node:fs/promises';
import { execa } from 'execa';
import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

// clean dist
await rm('dist', { recursive: true, force: true });

// only do typechecking and emit the type declarations with tsc
execa('tsc', ['--emitDeclarationOnly', '--project', './tsconfig.build.json'], {
  stdio: 'inherit',
  preferLocal: true,
});

// build with esbuild
esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  tsconfig: './tsconfig.build.json',
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  define: {
    'process.env.TUTORIALKIT_DEV': JSON.stringify(process.env.TUTORIALKIT_DEV ?? null),
  },
  plugins: [nodeExternalsPlugin()],
});

if (existsSync('./dist/default')) {
  assert.fail('TypeScript transpiled the default folder, it means that the tsconfig has an issue');
}

// copy default folder unmodified
await cp('./src/default', './dist/default', { recursive: true });
