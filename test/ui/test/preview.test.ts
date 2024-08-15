import { test, expect } from '@playwright/test';

const BASE_URL = '/tests/preview';

test('user can see single preview tab', async ({ page }) => {
  await page.goto(`${BASE_URL}/single`);

  await expect(page.getByRole('heading', { level: 1, name: 'Preview test - Single' })).toBeVisible();

  await expect(page.getByText('Node Server')).toBeVisible();

  const preview = page.frameLocator('[title="Node Server"]');
  await expect(preview.getByText('Default template')).toBeVisible();
  await expect(preview.getByText('Index')).toBeVisible();
});

test('user can see multiple preview tabs', async ({ page }) => {
  await page.goto(`${BASE_URL}/multiple`);

  await expect(page.getByRole('heading', { level: 1, name: 'Preview test - Multiple' })).toBeVisible();

  await expect(page.getByText('First Server')).toBeVisible();
  await expect(page.getByText('Second Server')).toBeVisible();

  await expect(page.frameLocator('[title="First Server"]').getByText('Index')).toBeVisible({ timeout: 10_000 });
  await expect(page.frameLocator('[title="Second Server"]').getByText('About')).toBeVisible({ timeout: 10_000 });
});
