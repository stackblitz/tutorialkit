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

test('editor should reflect changes made from webcontainer in file in nested folder', async ({ page }) => {
  const testCase = 'watch';
  await page.goto(`${BASE_URL}/${testCase}`);

  await page.getByRole('button', { name: 'baz.txt' }).click();

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Baz', {
    useInnerText: true,
  });

  await page.getByTestId('write-to-file-in-subfolder').click();

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Foo', {
    useInnerText: true,
  });
});
