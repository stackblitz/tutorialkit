import { test, expect } from '@playwright/test';
import { readLessonFilesAndSolution } from './utils.js';

const BASE_URL = '/tests/file-tree';

const fixtures = readLessonFilesAndSolution('file-tree/lesson-and-solution', 'file-tree/no-solution');

test('user can see lesson and solution files', async ({ page }) => {
  const testCase = 'lesson-and-solution';
  await page.goto(`${BASE_URL}/${testCase}`);

  await expect(page.getByRole('heading', { level: 1, name: 'File Tree test - Lesson and solution' })).toBeVisible();

  // lesson files
  for (const file of ['example.html', 'example.js']) {
    await page.getByRole('button', { name: file }).click();
    await expect(page.getByRole('button', { name: file, pressed: true })).toBeVisible();

    await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText(fixtures[testCase].files[file], {
      useInnerText: true,
    });
  }

  await page.getByRole('button', { name: 'Solve', disabled: false }).click();
  await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();

  // solution files
  for (const file of ['example.html', 'example.js']) {
    await page.getByRole('button', { name: file }).click();
    await expect(page.getByRole('button', { name: file, pressed: true })).toBeVisible();

    // TODO: Figure out why this is flaky
    await page.waitForTimeout(1_000);

    await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText(fixtures[testCase].solution[file], {
      useInnerText: true,
    });
  }
});

test('user can see cannot click solve on lessons without solution files', async ({ page }) => {
  const testCase = 'no-solution';
  await page.goto(`${BASE_URL}/${testCase}`);

  await expect(page.getByRole('heading', { level: 1, name: 'File Tree test - No solution' })).toBeVisible();

  // lesson files
  for (const file of ['example.html', 'example.js']) {
    await page.getByRole('button', { name: file }).click();
    await expect(page.getByRole('button', { name: file, pressed: true })).toBeVisible();

    await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText(fixtures[testCase].files[file], {
      useInnerText: true,
    });
  }

  // reset-button should be immediately visible
  await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
});

// TODO: Requires #245
test.skip('user should not see hidden file tree', async ({ page }) => {
  await page.goto(`${BASE_URL}/hidden`);
  await expect(page.getByRole('heading', { level: 1, name: 'File Tree test - Hidden' })).toBeVisible();

  await expect(page.getByText('Files')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'example.js' })).not.toBeVisible();
});

test('user cannot create files or folders when lesson is not configured via allowEdits', async ({ page }) => {
  await page.goto(`${BASE_URL}/allow-edits-disabled`);

  await expect(page.getByTestId('file-tree-root-context-menu')).not.toBeVisible();

  await page.getByRole('button', { name: 'first-level' }).click({ button: 'right' });
  await expect(page.getByRole('menuitem', { name: 'Create file' })).not.toBeVisible();
});

test('user can create files', async ({ page }) => {
  await page.goto(`${BASE_URL}/allow-edits-enabled`);
  await expect(page.getByRole('heading', { level: 1, name: 'File Tree test - Allow Edits Enabled' })).toBeVisible();

  // wait for terminal to start
  const terminal = page.getByRole('textbox', { name: 'Terminal input' });
  const terminalOutput = page.getByRole('tabpanel', { name: 'Terminal' });
  await expect(terminalOutput).toContainText('~/tutorial', { useInnerText: true });

  for (const [locator, filename] of [
    [page.getByTestId('file-tree-root-context-menu'), 'file-in-root.js'],
    [page.getByRole('button', { name: 'first-level' }), 'file-in-first-level.js'],
    [page.getByRole('button', { name: 'second-level' }), 'file-in-second-level.js'],
  ] as const) {
    await locator.click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Create file' }).click();

    await page.locator('*:focus').fill(filename);
    await page.locator('*:focus').press('Enter');
    await expect(page.getByRole('button', { name: filename, pressed: true })).toBeVisible();
  }

  // verify that all files are present on file tree after last creation
  await expect(page.getByRole('button', { name: 'file-in-root.js' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'file-in-first-level' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'file-in-second-level' })).toBeVisible();

  // verify that files are present on file system via terminal
  for (const [directory, filename] of [
    ['./', 'file-in-root.js'],
    ['./first-level', 'file-in-first-level.js'],
    ['./first-level/second-level', 'file-in-second-level.js'],
  ]) {
    await terminal.fill(`clear; ls ${directory}`);
    await terminal.press('Enter');

    await expect(terminalOutput).toContainText(filename, { useInnerText: true });
  }
});

test('user can create folders', async ({ page }) => {
  await page.goto(`${BASE_URL}/allow-edits-enabled`);
  await expect(page.getByRole('heading', { level: 1, name: 'File Tree test - Allow Edits Enabled' })).toBeVisible();

  // wait for terminal to start
  const terminal = page.getByRole('textbox', { name: 'Terminal input' });
  const terminalOutput = page.getByRole('tabpanel', { name: 'Terminal' });
  await expect(terminalOutput).toContainText('~/tutorial', { useInnerText: true });

  for (const [locator, folder] of [
    [page.getByTestId('file-tree-root-context-menu'), 'folder-1'],
    [page.getByRole('button', { name: 'folder-1' }), 'folder-2'],
    [page.getByRole('button', { name: 'folder-2' }), 'folder-3'],
  ] as const) {
    await locator.click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Create folder' }).click();

    await page.locator('*:focus').fill(folder);
    await page.locator('*:focus').press('Enter');
    await expect(page.getByRole('button', { name: folder })).toBeVisible();
  }

  // verify that all folders are present on file tree after last creation
  await expect(page.getByRole('button', { name: 'folder-1' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'folder-2' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'folder-3' })).toBeVisible();

  // verify that files are present on file system via terminal
  for (const [directory, folder] of [
    ['./', 'folder-1'],
    ['./folder-1', 'folder-2'],
    ['./folder-1/folder-2', 'folder-3'],
  ]) {
    await terminal.fill(`clear; ls ${directory}`);
    await terminal.press('Enter');

    await expect(terminalOutput).toContainText(folder, { useInnerText: true });
  }
});
