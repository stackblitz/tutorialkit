import fs from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { globSync, convertPathToPattern } from 'fast-glob';
import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss';
import { rules, shortcuts, theme } from '@tutorialkit/theme';

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
  rules,
  shortcuts,
  theme,
  content: {
    inline: globSync([
      `${convertPathToPattern(join(require.resolve('@tutorialkit/components-react'), '..')).replace('\\@', '/@')}/**/*.js`,
      `${convertPathToPattern(join(require.resolve('@tutorialkit/astro'), '..')).replace('\\@', '/@')}/default/**/*.astro`,
    ]).map((filePath) => {
      return () => fs.readFile(filePath, { encoding: 'utf8' });
    }),
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno({
      dark: {
        dark: '[data-theme="dark"]',
      },
    }),
    presetIcons({
      collections: {
        ...customIconCollection,
      },
    }),
  ],
});
