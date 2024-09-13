import blitzPlugin from '@blitz/eslint-plugin';
import { getNamingConventionRule, tsFileExtensions } from '@blitz/eslint-plugin/dist/configs/typescript.js';
import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/.astro/**',
      '**/.vscode-test/**',

      // we ignore our demo templates because they may contain code that is formatted specifically for the demo
      'docs/demo/src/templates',
    ],
  },
  ...blitzPlugin.configs.recommended({
    ts: {
      namingConvention: {
        variable: {
          exceptions: ['Content', '__ENTERPRISE__', '__WC_CONFIG__', 'WebContainer'],
        },
      },
    },
  }),
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/env.d.ts', '**/env-default.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',

      'multiline-comment-style': 'off',
    },
  },
  {
    files: tsFileExtensions,
    rules: {
      // we turn this off in favor of TypeScripts's `noImplicitReturns`
      'consistent-return': 'off',

      '@typescript-eslint/no-this-alias': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    rules: {
      ...getNamingConventionRule({}, true),
    },
  },
];
