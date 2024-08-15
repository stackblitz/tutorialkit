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
