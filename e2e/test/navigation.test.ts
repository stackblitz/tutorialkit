import { test as base, expect } from '@playwright/test';

const test = base.extend<{ menu: { navigate: (name: { from: string; to: string }) => Promise<void> } }>({
  menu: async ({ page }, use) => {
    async function navigate({ from, to }: { from: string; to: string }) {
      // navigation select can take a while to hydrate on page load, click until responsive
      await expect(async () => {
        const button = page.getByRole('button', { name: `Tests / Navigation / ${from}` });
        await button.click();
        await expect(page.locator('[data-state="open"]', { has: button })).toBeVisible({ timeout: 50 });
      }).toPass();

      await page.getByRole('region', { name: 'Navigation' }).getByRole('link', { name: to }).click();

      await expect(page.getByRole('heading', { level: 1, name: `Navigation test - ${to}` })).toBeVisible();
    }

    await use({ navigate });
  },
});

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

test('user can navigate between lessons using breadcrumbs', async ({ page, menu }) => {
  await page.goto(`${BASE_URL}/page-one`);

  await menu.navigate({ from: 'Page one', to: 'Page three' });

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

test('user should not see preview on lessons that disable it (#405)', async ({ page, menu }) => {
  await page.goto(`${BASE_URL}/layout-change-from`);

  // first page should have preview visible
  await expect(page.getByRole('heading', { level: 1, name: 'Navigation test - Layout change from' })).toBeVisible();

  const preview = page.frameLocator('[title="Custom preview"]');
  await expect(preview.getByText('Index page')).toBeVisible();

  await menu.navigate({ from: 'Layout change from', to: 'Layout change all off' });

  // preview should not be visible
  await expect(page.locator('iframe[title="Custom preview"]')).not.toBeVisible();

  // navigate back and check preview is visible once again
  await menu.navigate({ from: 'Layout change all off', to: 'Layout change from' });

  {
    const preview = page.frameLocator('[title="Custom preview"]');
    await expect(preview.getByText('Index page')).toBeVisible();
  }
});
