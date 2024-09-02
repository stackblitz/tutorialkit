import { test, expect } from '@playwright/test';

const BASE_URL = '/tests/preview';

test('user can see single preview tab', async ({ page }) => {
  await page.goto(`${BASE_URL}/single`);

  await expect(page.getByRole('heading', { level: 1, name: 'Preview test - Single' })).toBeVisible();

  await expect(page.getByText('Node Server')).toBeVisible();

  const preview = page.frameLocator('[title="Node Server"]');
  await expect(preview.getByText('Index page')).toBeVisible();
});

test('user can reload a preview tab', async ({ page }) => {
  await page.goto(`${BASE_URL}/single`);

  const preview = page.frameLocator('[title="Node Server"]');

  await expect(preview.getByText('Index page')).toBeVisible();

  await page.getByTestId('write-to-file').click();

  await expect(preview.getByText('Index page')).toBeVisible();

  await page.getByRole('button', { name: 'Reload Preview' }).click();

  await expect(preview.getByText('New content')).toBeVisible();
});

test('user can see multiple preview tabs', async ({ page }) => {
  await page.goto(`${BASE_URL}/multiple`);

  await expect(page.getByRole('heading', { level: 1, name: 'Preview test - Multiple' })).toBeVisible();

  await expect(page.getByText('First Server')).toBeVisible();
  await expect(page.getByText('Second Server')).toBeVisible();

  await expect(page.frameLocator('[title="First Server"]').getByText('Index page')).toBeVisible({ timeout: 10_000 });
  await expect(page.frameLocator('[title="Second Server"]').getByText('About page')).toBeVisible({ timeout: 10_000 });
});

test('user can see new content when "autoReload: true" is set', async ({ page }) => {
  await page.goto(`${BASE_URL}/auto-reload-1-from`);

  await expect(page.getByRole('heading', { level: 1, name: 'Preview test - Auto Reload From' })).toBeVisible();
  await expect(page.frameLocator('[title="Server"]').getByText('Before')).toBeVisible({ timeout: 10_000 });

  await page.getByRole('link', { name: 'Auto Reload To' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Preview test - Auto Reload To' })).toBeVisible();
  await expect(page.frameLocator('[title="Server"]').getByText('After')).toBeVisible({ timeout: 10_000 });
});

test('user can see old content when "autoReload: false" is set', async ({ page }) => {
  await page.goto(`${BASE_URL}/auto-reload-2-to`);

  await expect(page.getByRole('heading', { level: 1, name: 'Preview test - Auto Reload To' })).toBeVisible();
  await expect(page.frameLocator('[title="Server"]').getByText('After')).toBeVisible({ timeout: 10_000 });

  await page.getByRole('link', { name: 'Auto Reload Off' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Preview test - Auto Reload Off' })).toBeVisible();

  // preview content should not change
  await expect(page.frameLocator('[title="Server"]').getByText('After')).toBeVisible({ timeout: 10_000 });

  // reload page and verify the test case has different content than "Auto Reload To"-page
  await page.reload();
  await expect(
    page.frameLocator('[title="Server"]').getByText('This should not be visible when navigated to'),
  ).toBeVisible({ timeout: 10_000 });
});
