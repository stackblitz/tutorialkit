import { test, expect } from '@playwright/test';

const BASE_URL = '/tests/metadata';

test('developer can pass custom metadata to lesson', async ({ page }) => {
  await page.goto(`${BASE_URL}/custom`);
  await expect(page.getByRole('heading', { level: 1, name: 'Metadata test - Custom' })).toBeVisible();

  await expect(page.getByRole('heading', { level: 2, name: 'Custom metadata' })).toBeVisible();

  await expect(page.getByText('"custom-message": "Hello world"')).toBeVisible();
  await expect(page.getByText('"numeric-field": 5173')).toBeVisible();
});
