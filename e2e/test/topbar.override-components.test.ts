import { test, expect } from '@playwright/test';

test('developer can override TopBar', async ({ page }) => {
  await page.goto('/');

  const nav = page.getByRole('navigation');
  await expect(nav.getByText('Custom Top Bar Mounted')).toBeVisible();

  // default elements should also be visible
  await expect(nav.getByRole('button', { name: 'Download lesson as zip-file' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Open in StackBlitz' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Toggle Theme' })).toBeVisible();
});
