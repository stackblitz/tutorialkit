import * as fastGlob from 'fast-glob';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, dirname, resolve } from 'node:path';
import { mergeConfigs, presetIcons, presetWind4, transformerDirectives, type UserConfig } from 'unocss';

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
        presetWind4({
          dark: {
            dark: '[data-theme="dark"]',
          },
        }),
        presetIcons({
          collections: {
            ...readCustomIcons(),
            ph: () => loadIconifyCollection('ph'),
            'svg-spinners': () => loadIconifyCollection('svg-spinners'),
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

async function loadIconifyCollection(name: string) {
  // Try to require the package (works for CJS or when package exposes a CJS entry)
  try {
    // use createRequire to ensure resolution from the package context

    const pkg = require(`@iconify-json/${name}`);

    if (pkg && pkg.icons) {
      return pkg.icons;
    }
  } catch {
    // fallthrough to fs-based resolution
  }

  // Fall back: resolve package root and try to find a JSON file with icons
  try {
    const pkgJsonPath = require.resolve(`@iconify-json/${name}/package.json`, { paths: [process.cwd()] });
    const pkgRoot = dirname(pkgJsonPath);

    // Common icon file names
    const candidates = ['icons.json', 'index.json', 'icons/index.json'];

    for (const cand of candidates) {
      try {
        const full = resolve(pkgRoot, cand);
        const text = await fs.readFile(full, 'utf8');
        const parsed = JSON.parse(text);

        if (parsed && parsed.icons) {
          return parsed.icons;
        }

        // sometimes the package itself *is* the icons object
        if (parsed && Object.keys(parsed).length) {
          return parsed;
        }
      } catch {
        // try next candidate
      }
    }
  } catch {
    // give up
  }

  // Last resort: return an empty collection to avoid throwing at build-time
  return {};
}
