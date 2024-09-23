import { test, expect } from '@playwright/test';

const BASE_URL = '/tests/file-tree';

test('developer can override dialog in File Tree', async ({ page }) => {
  await page.goto(`${BASE_URL}/allow-edits-glob`);
  await expect(page.getByRole('heading', { level: 1, name: 'File Tree test - Allow Edits Glob' })).toBeVisible();

  await page.getByRole('button', { name: 'first-level' }).click({ button: 'right' });
  await page.getByRole('menuitem', { name: `Create file` }).click();

  await page.locator('*:focus').fill('new-file.js');
  await page.locator('*:focus').press('Enter');

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { level: 2, name: 'Custom Dialog' })).toBeVisible();

  // default elements should also be visible
  await expect(dialog.getByText('Created files and folders must match following patterns:')).toBeVisible();
  await expect(dialog.getByRole('listitem').nth(0)).toHaveText('/*');
  await expect(dialog.getByRole('listitem').nth(1)).toHaveText('/first-level/allowed-filename-only.js');
  await expect(dialog.getByRole('listitem').nth(2)).toHaveText('**/second-level/**');

  await dialog.getByRole('button', { name: 'OK' }).click();
  await expect(dialog).not.toBeVisible();
});
