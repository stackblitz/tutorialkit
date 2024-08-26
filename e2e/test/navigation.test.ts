import { test, expect } from '@playwright/test';

const BASE_URL = '/tests/navigation/page-one';

test('user can navigate between lessons using nav bar links', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page.getByRole('heading', { level: 1, name: 'Navigation test - Page one' })).toBeVisible();

  // navigate forwards
  await navigateToPage('Page two');
  await navigateToPage('Page three');

  // navigate backwards
  await navigateToPage('Page two');
  await navigateToPage('Page one');

  async function navigateToPage(title: string) {
    await page.getByRole('link', { name: title }).click();
    await expect(page.getByRole('heading', { level: 1, name: `Navigation test - ${title}` })).toBeVisible();
  }
});

test('user can navigate between lessons using breadcrumbs', async ({ page }) => {
  await page.goto(BASE_URL);

  await page.getByRole('button', { name: 'Tests / Navigation / Page one' }).click({ force: true });
  await page.getByRole('region', { name: 'Navigation' }).getByRole('link', { name: 'Page three' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Navigation test - Page three' })).toBeVisible();
});
