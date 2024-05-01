import transformerDirectives from '@unocss/transformer-directives';
import { globSync } from 'fast-glob';
import fs from 'node:fs/promises';
import { basename, dirname } from 'node:path';
import { defineConfig, presetIcons, presetUno } from 'unocss';
import { theme } from './theme';

const iconPaths = globSync('./icons/languages/*.svg');

const customIconCollection = iconPaths.reduce(
  (acc, iconPath) => {
    const collectionName = basename(dirname(iconPath));
    const [iconName] = basename(iconPath).split('.');

    acc[collectionName] ??= {};
    acc[collectionName][iconName] = async () => fs.readFile(iconPath, 'utf8');

    return acc;
  },
  {} as Record<string, Record<string, () => Promise<string>>>,
);

export default defineConfig({
  theme,
  rules: [
    ['scrollbar-transparent', { 'scrollbar-color': '#0000004d transparent' }],
    ['nav-box-shadow', { 'box-shadow': '0 2px 4px -1px rgba(0, 0, 0, 0.1)' }],
  ],
  shortcuts: {
    'panel-container': 'grid grid-rows-[min-content_1fr] h-full',
    'panel-header': 'flex gap-2 items-center px-4 py-2 bg-gray-50/70',
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        ...customIconCollection,
      },
    }),
  ],
});
