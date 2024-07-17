import * as esbuild from 'esbuild';
import fs from 'node:fs';
import { execa } from 'execa';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'silent',
    plugins: [
      /* add to the end of plugins array */
      esbuildProblemMatcherPlugin,
    ],
  });

  if (watch) {
    await Promise.all([
      ctx.watch(),
      execa('tsc', ['--noEmit', '--watch', '--project', 'tsconfig.json'], { stdio: 'inherit', preferLocal: true }),
    ]);
  } else {
    await ctx.rebuild();
    await ctx.dispose();

    if (production) {
      // rename name in package json to match extension name on store:
      const pkgJSON = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' }));

      pkgJSON.name = 'tutorialkit';

      fs.writeFileSync('./package.json', JSON.stringify(pkgJSON, undefined, 2), 'utf8');
    }
  }
}

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',
  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log('[watch] build finished');
    });
  },
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
