/// <reference types="node" />
import { readdirSync, readFileSync, rmSync } from 'node:fs';
import type { Readable } from 'node:stream';
import { test, expect } from '@playwright/test';
import * as unzipper from 'unzipper';
import { theme } from '../../packages/theme/src/theme';

test('user can change theme', async ({ page }) => {
  await page.goto('/');

  const heading = page.getByRole('heading', { level: 1 });
  const html = page.locator('html');

  // default light theme
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(heading).toHaveCSS('color', hexToRGB(theme.colors.gray[800]));

  await page.getByRole('navigation').getByRole('button', { name: 'Toggle Theme' }).click();

  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(heading).toHaveCSS('color', hexToRGB(theme.colors.gray[200]));
});

test('user can download project as zip', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('navigation').getByRole('button', { name: 'Download lesson as zip-file' }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('tests-file-tree-allow-edits-disabled.zip');

  const stream = await download.createReadStream();
  const files = await unzip(stream);

  expect(files).toMatchObject({
    './tutorial/file-on-template.js': "export default 'This file is present on template';\n",
    './tutorial/first-level/file.js': "export default 'File in first level';\n",
    './tutorial/first-level/second-level/file.js': "export default 'File in second level';\n",
  });

  expect(files['./tutorial/index.mjs']).toMatch("import http from 'node:http'");
});

function hexToRGB(hex: string) {
  return `rgb(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)})`;
}

async function unzip(stream: Readable) {
  await stream.pipe(unzipper.Extract({ path: './downloads' })).promise();

  const files = readDirectoryContents('./downloads');
  rmSync('./downloads', { recursive: true });

  return files.reduce(
    (all, current) => ({
      ...all,
      [current.name.replace('/downloads', '')]: current.content,
    }),
    {},
  );
}

function readDirectoryContents(directory: string) {
  const files: { name: string; content: string }[] = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const name = `${directory}/${entry.name}`;

    if (entry.isFile()) {
      files.push({ name, content: readFileSync(name, 'utf-8') });
    } else if (entry.isDirectory()) {
      files.push(...readDirectoryContents(name));
    }
  }

  return files;
}
