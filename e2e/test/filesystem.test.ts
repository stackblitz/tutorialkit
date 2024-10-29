import { test, expect } from '@playwright/test';

const BASE_URL = '/tests/filesystem';

test('editor should reflect changes made from webcontainer', async ({ page }) => {
  const testCase = 'watch';
  await page.goto(`${BASE_URL}/${testCase}`);

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Initial content\n', {
    useInnerText: true,
  });

  await page.getByTestId('write-to-file').click();

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Something else', {
    useInnerText: true,
  });
});

test('editor should reflect changes made from webcontainer in file in nested folder and not add new files', async ({ page }) => {
  const testCase = 'watch';
  await page.goto(`${BASE_URL}/${testCase}`);

  await page.getByTestId('write-new-ignored-file').click();
  await page.getByRole('button', { name: 'baz.txt' }).click();

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Baz', {
    useInnerText: true,
  });

  await page.getByTestId('write-to-file-in-subfolder').click();

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Foo', {
    useInnerText: true,
  });
  expect(await page.getByRole('button', { name: 'other.txt' }).count()).toEqual(0);
});

test('editor should reflect changes made from webcontainer in specified paths', async ({ page }) => {
  const testCase = 'watch-glob';
  await page.goto(`${BASE_URL}/${testCase}`);

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Initial content\n', {
    useInnerText: true,
  });

  await page.getByTestId('write-to-file').click();

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Something else', {
    useInnerText: true,
  });
});

test('editor should reflect new files added in specified paths in webcontainer', async ({ page }) => {
  const testCase = 'watch-glob';
  await page.goto(`${BASE_URL}/${testCase}`);

  await page.getByTestId('write-new-ignored-file').click();
  await page.getByTestId('write-new-file').click();

  await page.getByRole('button', { name: 'new.txt' }).click();
  expect(await page.getByRole('button', { name: 'other.txt' }).count()).toEqual(0);

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('New', {
    useInnerText: true,
  });
});

test('editor should not reflect changes made from webcontainer if watch is not set', async ({ page }) => {
  const testCase = 'no-watch';
  await page.goto(`${BASE_URL}/${testCase}`);

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Initial content\n', {
    useInnerText: true,
  });

  await page.getByTestId('write-to-file').click();

  await page.waitForTimeout(1_000);

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Initial content\n', {
    useInnerText: true,
  });
});
