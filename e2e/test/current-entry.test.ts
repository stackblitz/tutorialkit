import { test, expect } from '@playwright/test';

const BASE_URL = '/tests/current-entry';

test('developer can access current lesson and collection entry from Astro.locals', async ({ page }) => {
  await page.goto(`${BASE_URL}/basic`);

  // lesson id
  await expect(page.getByText('"id": "basic"')).toBeVisible();

  // astro collection entry id
  await expect(page.getByText('"id": "tests/current-entry/basic/content.mdx"')).toBeVisible();
});
