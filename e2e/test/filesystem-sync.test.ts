import { test, expect } from '@playwright/test';

const BASE_URL = '/tests/filesystem-sync';

test('editor should reflect changes made in webcontainer', async ({ page }) => {
  const testCase = 'happy-path';
  await page.goto(`${BASE_URL}/${testCase}`);

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Initial content\n', {
    useInnerText: true,
  });

  await page.getByTestId('write-to-file').click();

  await expect(page.getByRole('textbox', { name: 'Editor' })).toHaveText('Something else', {
    useInnerText: true,
  });
});
