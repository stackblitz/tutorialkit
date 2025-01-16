import { test, expect } from '@playwright/test';

test('user can navigate between lessons using breadcrumbs', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Lessons in part test - Lesson one' })).toBeVisible();
  await expect(page.getByText('Lesson in part without chapter')).toBeVisible();

  // navigation select can take a while to hydrate on page load, click until responsive
  await expect(async () => {
    const button = page.getByRole('button', { name: 'Part one / Lesson one' });
    await button.click();
    await expect(page.locator('[data-state="open"]', { has: button })).toBeVisible({ timeout: 50 });
  }).toPass();

  const navigation = page.getByRole('navigation');
  await navigation.getByRole('region', { name: 'Part 1: Part one' }).getByRole('link', { name: 'Lesson two' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Lessons in part test - Lesson two' })).toBeVisible();
  await expect(page.getByText('Lesson in part without chapter')).toBeVisible();

  await expect(async () => {
    const button = page.getByRole('button', { name: 'Part one / Lesson two' });
    await button.click();
    await expect(page.locator('[data-state="open"]', { has: button })).toBeVisible({ timeout: 50 });
  }).toPass();

  // expand part
  await navigation.getByRole('button', { name: 'Part 2: Part two' }).click();

  // expand chapter
  await navigation
    .getByRole('region', { name: 'Part 2: Part two' })
    .getByRole('button', { name: 'Chapter one' })
    .click();

  // select lesson
  await navigation.getByRole('region', { name: 'Chapter one' }).getByRole('link', { name: 'Lesson three' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Lessons in part test - Lesson three' })).toBeVisible();
  await expect(page.getByText('Lesson in chapter')).toBeVisible();
});

test('user can navigate between lessons using nav bar links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Lessons in part test - Lesson one' })).toBeVisible();
  await expect(page.getByText('Lesson in part without chapter')).toBeVisible();

  await navigateToPage('Lesson two');
  await expect(page.getByText('Lesson in part without chapter')).toBeVisible();

  await navigateToPage('Lesson three');
  await expect(page.getByText('Lesson in chapter')).toBeVisible();

  await navigateToPage('Lesson four');
  await expect(page.getByText('Lesson in chapter')).toBeVisible();

  async function navigateToPage(title: string) {
    await page.getByRole('link', { name: title }).click();
    await expect(page.getByRole('heading', { level: 1, name: `Lessons in part test - ${title}` })).toBeVisible();
  }
});
