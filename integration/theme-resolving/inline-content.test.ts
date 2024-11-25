import fs from 'node:fs/promises';
import path from 'node:path';
import { getInlineContentForPackage } from '@tutorialkit/theme';
import { execa } from 'execa';
import { temporaryDirectory } from 'tempy';
import { afterAll, expect, test } from 'vitest';

const baseDir = path.resolve(__dirname, '../..');
const cli = path.join(baseDir, 'packages/cli/dist/index.js');
const tmp = temporaryDirectory();

afterAll(async () => {
  await fs.rm(tmp, { force: true, recursive: true });
});

test('getInlineContentForPackage finds files from @tutorialkit/astro', async () => {
  await execa(
    'node',
    [cli, 'create', 'theme-test', '--install', '--no-git', '--no-start', '--package-manager', 'pnpm', '--defaults'],
    { cwd: tmp },
  );

  const content = getInlineContentForPackage({
    name: '@tutorialkit/astro',
    pattern: '/dist/default/**/*.astro',
    root: `${tmp}/theme-test`,
  });

  expect(content.length).toBeGreaterThan(0);
});
