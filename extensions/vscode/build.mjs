import { chapterSchema, lessonSchema, partSchema, tutorialSchema } from '@tutorialkit/types';
import { watch } from 'chokidar';
import * as esbuild from 'esbuild';
import { execa } from 'execa';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { zodToJsonSchema } from 'zod-to-json-schema';

const require = createRequire(import.meta.url);
const production = process.argv.includes('--production');
const isWatch = process.argv.includes('--watch');

async function main() {
  const ctx = await esbuild.context({
    entryPoints: {
      extension: 'src/extension.ts',
      server: './src/language-server/index.ts',
    },
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    tsconfig: './tsconfig.json',
    platform: 'node',
    outdir: 'dist',
    define: { 'process.env.NODE_ENV': production ? '"production"' : '"development"' },
    external: ['vscode'],
    plugins: [esbuildUMD2ESMPlugin],
  });

  if (isWatch) {
    const buildMetadataSchemaDebounced = debounce(buildMetadataSchema);

    watch(join(require.resolve('@tutorialkit/types'), 'dist'), {
      followSymlinks: false,
    }).on('all', (eventName, path) => {
      if (eventName !== 'change' && eventName !== 'add' && eventName !== 'unlink') {
        return;
      }

      buildMetadataSchemaDebounced();
    });

    await Promise.all([
      ctx.watch(),
      execa('tsc', ['--noEmit', '--watch', '--preserveWatchOutput', '--project', 'tsconfig.json'], {
        stdio: 'inherit',
        preferLocal: true,
      }),
    ]);
  } else {
    await ctx.rebuild();
    await ctx.dispose();

    buildMetadataSchema();

    if (production) {
      // rename name in package json to match extension name on store:
      const pkgJSON = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' }));

      pkgJSON.name = 'tutorialkit';

      fs.writeFileSync('./package.json', JSON.stringify(pkgJSON, undefined, 2), 'utf8');
    }
  }
}

function buildMetadataSchema() {
  const schema = tutorialSchema.strict().or(partSchema.strict()).or(chapterSchema.strict()).or(lessonSchema.strict());

  fs.mkdirSync('./dist', { recursive: true });
  fs.writeFileSync('./dist/schema.json', JSON.stringify(zodToJsonSchema(schema), undefined, 2), 'utf-8');
}

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildUMD2ESMPlugin = {
  name: 'umd2esm',
  setup(build) {
    build.onResolve({ filter: /^(vscode-.*-languageservice|jsonc-parser)/ }, (args) => {
      const pathUmdMay = require.resolve(args.path, { paths: [args.resolveDir] });
      const pathEsm = pathUmdMay.replace('/umd/', '/esm/').replace('\\umd\\', '\\esm\\');

      return { path: pathEsm };
    });
  },
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Debounce the provided function.
 *
 * @param {Function} fn Function to debounce
 * @param {number} duration Duration of the debounce
 * @returns {Function} Debounced function
 */
function debounce(fn, duration) {
  let timeoutId = 0;

  return function () {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(fn.bind(this), duration, ...arguments);
  };
}
