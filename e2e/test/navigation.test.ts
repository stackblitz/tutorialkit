import { test, expect } from '@playwright/test';

const BASE_URL = '/tests/navigation';

test('user can navigate between lessons using nav bar links', async ({ page }) => {
  await page.goto(`${BASE_URL}/page-one`);
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
  await page.goto(`${BASE_URL}/page-one`);

  await page.getByRole('button', { name: 'Tests / Navigation / Page one' }).click({ force: true });
  await page.getByRole('region', { name: 'Navigation' }).getByRole('link', { name: 'Page three' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Navigation test - Page three' })).toBeVisible();
});

test("user should see metadata's layout changes after navigation (#318)", async ({ page }) => {
  await page.goto(`${BASE_URL}/layout-change-from`);

  // first page should have preview visible
  await expect(page.getByRole('heading', { level: 1, name: 'Navigation test - Layout change from' })).toBeVisible();
  await expect(page.getByText('Custom preview')).toBeVisible();

  await page.getByRole('link', { name: 'Layout change to' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Navigation test - Layout change to' })).toBeVisible();

  // second page should have preview hidden, terminal visible

  /* eslint-disable multiline-comment-style */
  // TODO: Requires #245
  // await expect(page.getByText('Preparing Environment')).not.toBeVisible();

  await expect(page.getByRole('tab', { name: 'Custom Terminal', selected: true })).toBeVisible();
  await expect(page.getByRole('tabpanel', { name: 'Custom Terminal' })).toContainText('~/tutorial', {
    useInnerText: true,
  });
});
