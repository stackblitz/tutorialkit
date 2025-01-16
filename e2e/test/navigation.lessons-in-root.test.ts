import { test, expect } from '@playwright/test';

test('user can navigate between lessons using breadcrumbs', async ({ page }) => {
  await page.goto('/lesson-one');

  await expect(page.getByRole('heading', { level: 1, name: 'Lessons in root test - Lesson one' })).toBeVisible();
  await expect(page.getByText('Lesson in root without part')).toBeVisible();

  // navigation select can take a while to hydrate on page load, click until responsive
  await expect(async () => {
    const button = page.getByRole('button', { name: 'Lesson one' });
    await button.click();
    await expect(page.locator('[data-state="open"]', { has: button })).toBeVisible({ timeout: 50 });
  }).toPass();

  await page.getByRole('navigation').getByRole('link', { name: 'Lesson two' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Lessons in root test - Lesson two' })).toBeVisible();
});
