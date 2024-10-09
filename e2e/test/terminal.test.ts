import { test, expect } from '@playwright/test';

const BASE_URL = '/tests/terminal';

test('user can open terminal', async ({ page }) => {
  await page.goto(`${BASE_URL}/default`);

  await expect(page.getByRole('heading', { level: 1, name: 'Terminal test - Default' })).toBeVisible();

  const tab = page.getByRole('tab', { name: 'Terminal' });
  const panel = page.getByRole('tabpanel', { name: 'Terminal' });

  /* eslint-disable multiline-comment-style */
  // TODO: Requires #245
  // await expect(tab).not.toBeVisible();
  // await expect(panel).not.toBeVisible();

  // terminal toggle can take a while to hydrate on page load, click until responsive
  await expect(async () => {
    await page.getByRole('button', { name: 'Toggle Terminal' }).click();

    await expect(tab).toBeVisible({ timeout: 100 });
    await expect(panel).toBeVisible({ timeout: 100 });
  }).toPass();

  await expect(panel).toContainText('~/tutorial', { useInnerText: true });
});

test('user can see terminal open by default', async ({ page }) => {
  await page.goto(`${BASE_URL}/open-by-default`);

  await expect(page.getByRole('heading', { level: 1, name: 'Terminal test - Open by default' })).toBeVisible();

  await expect(page.getByRole('tab', { name: 'Terminal', selected: true })).toBeVisible();
  await expect(page.getByRole('tabpanel', { name: 'Terminal' })).toContainText('~/tutorial', { useInnerText: true });
});
