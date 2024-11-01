import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, dirname, resolve } from 'node:path';
import * as fastGlob from 'fast-glob';
import { mergeConfigs, presetIcons, presetUno, transformerDirectives, type UserConfig } from 'unocss';

import { theme } from './theme.js';
import { transitionTheme } from './transition-theme.js';
import { toCSSRules } from './utils.js';

const { globSync, convertPathToPattern } = fastGlob.default;
const require = createRequire(import.meta.url);

export function defineConfig(config: UserConfig) {
  return mergeConfigs([
    {
      theme,
      shortcuts,
      rules,
      transformers: [transformerDirectives()],
      content: {
        inline: getInlineContentForPackage({
          name: '@tutorialkit/react',
          pattern: '/dist/**/*.js',
          root: process.cwd(),
        }),
      },
      presets: [
        presetUno({
          dark: {
            dark: '[data-theme="dark"]',
          },
        }),
        presetIcons({
          collections: {
            ...readCustomIcons(),
            ph: () => import('@iconify-json/ph').then((i) => i.icons),
            'svg-spinners': () => import('@iconify-json/svg-spinners').then((i) => i.icons),
          },
        }),
      ],
    },
    config,
  ]);
}

export function getInlineContentForPackage({ name, pattern, root }: { name: string; pattern: string; root: string }) {
  try {
    const packageRoot = resolve(require.resolve(`${name}/package.json`, { paths: [root] }), '..');

    // work-around for https://github.com/mrmlnc/fast-glob/issues/452
    const packagePattern = convertPathToPattern(packageRoot.replaceAll('\\@', '/@'));

    return globSync(`${packagePattern}${pattern}`).map((filePath) => () => fs.readFile(filePath, { encoding: 'utf8' }));
  } catch {
    return [];
  }
}

function readCustomIcons() {
  const iconPaths = globSync('./icons/languages/*.svg');

  return iconPaths.reduce<Record<string, Record<string, () => Promise<string>>>>((acc, iconPath) => {
    const collectionName = basename(dirname(iconPath));
    const [iconName] = basename(iconPath).split('.');

    acc[collectionName] ??= {};
    acc[collectionName][iconName] = async () => fs.readFile(iconPath, 'utf8');

    return acc;
  }, {});
}

const rules: UserConfig['rules'] = [
  ['scrollbar-transparent', { 'scrollbar-color': '#0000004d transparent' }],
  ['nav-box-shadow', { 'box-shadow': '0 2px 4px -1px rgba(0, 0, 0, 0.1)' }],
  ['transition-theme', toCSSRules(transitionTheme)],
];

const shortcuts: UserConfig['shortcuts'] = {
  'panel-container': 'grid grid-rows-[min-content_1fr] h-full',
  'panel-header':
    'flex items-center px-4 py-2 transition-theme bg-tk-elements-panel-header-backgroundColor min-h-[38px] overflow-x-hidden',
  'panel-tabs-header': 'flex transition-theme bg-tk-elements-panel-header-backgroundColor h-[38px]',
  'panel-title': 'flex items-center gap-1.5 text-tk-elements-panel-header-textColor',
  'panel-icon': 'text-tk-elements-panel-header-iconColor',
  'panel-button':
    'flex items-center gap-1.5 whitespace-nowrap rounded-md text-sm transition-theme bg-tk-elements-panel-headerButton-backgroundColor hover:bg-tk-elements-panel-headerButton-backgroundColorHover text-tk-elements-panel-headerButton-textColor hover:text-tk-elements-panel-headerButton-textColorHover',
};
