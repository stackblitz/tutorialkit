import { test, expect } from '@playwright/test';

const BASE_URL = '/tests/lesson-order';

test('developer can configure custom order for lessons', async ({ page }) => {
  await page.goto(`${BASE_URL}/1-lesson`);
  await expect(page.getByRole('heading', { level: 1, name: 'Lesson order test - Page one' })).toBeVisible();

  // navigation select can take a while to hydrate on page load, click until responsive
  await expect(async () => {
    const button = page.getByRole('button', { name: 'Tests / Lesson order / Page one' });
    await button.click();
    await expect(page.locator('[data-state="open"]', { has: button })).toBeVisible({ timeout: 50 });
  }).toPass();

  const list = page.getByRole('region', { name: 'Lesson order' });

  // configured ordered is [2, 3, 1]
  await expect(list.getByRole('listitem').nth(0)).toHaveText('Page two');
  await expect(list.getByRole('listitem').nth(1)).toHaveText('Page three');
  await expect(list.getByRole('listitem').nth(2)).toHaveText('Page one');
});
