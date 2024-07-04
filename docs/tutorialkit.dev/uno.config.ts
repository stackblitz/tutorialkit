import { theme, rules, shortcuts } from '@tutorialkit/theme';
import { convertPathToPattern, globSync } from 'fast-glob';
import fs from 'node:fs/promises';
import { join } from 'path';
import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss';

export default defineConfig({
  theme,
  rules,
  shortcuts,
  content: {
    inline: globSync(
      `${convertPathToPattern(join(require.resolve('@tutorialkit/components-react'), '..'))}/**/*.js`,
    ).map((filePath) => {
      return () => fs.readFile(filePath, { encoding: 'utf8' });
    }),
  },
  transformers: [transformerDirectives()],
  presets: [presetUno(), presetIcons()],
});
