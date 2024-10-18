import { test, expect } from '@playwright/test';

test('user can navigate between lessons using breadcrumbs', async ({ page }) => {
  await page.goto('/part-one/lesson-one');

  await expect(page.getByRole('heading', { level: 1, name: 'Lessons in part test - Lesson one' })).toBeVisible();
  await expect(page.getByText('Lesson in part without chapter')).toBeVisible();

  // navigation select can take a while to hydrate on page load, click until responsive
  await expect(async () => {
    const button = page.getByRole('button', { name: 'Part one / Lesson one' });
    await button.click();
    await expect(page.locator('[data-state="open"]', { has: button })).toBeVisible({ timeout: 50 });
  }).toPass();

  await page.getByRole('navigation').getByRole('link', { name: 'Lesson two' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Lessons in part test - Lesson two' })).toBeVisible();
});
