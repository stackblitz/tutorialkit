import { test, expect } from '@playwright/test';

test('developer can override HeadTags', async ({ page }) => {
  await page.goto('/');

  const defaultElems = [
    page.locator('title'),
    page.locator('meta[name="og:title"]'),
    page.locator('link[rel="stylesheet"]').first(),
  ];
  const customElems = [
    page.locator('meta[name="e2e-test-custom-meta-tag"][content="custom-content"]'),
    page.locator('link[rel="sitemap"]'),
  ];

  for (const e of defaultElems) {
    await expect(e).toBeAttached();
  }

  for (const e of customElems) {
    await expect(e).toBeAttached();
  }
});
