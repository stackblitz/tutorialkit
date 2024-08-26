import { defineConfig } from '@playwright/test';

export default defineConfig({
  expect: {
    timeout: process.env.CI ? 30_000 : 10_000,
  },
  use: {
    baseURL: 'http://localhost:4329',
  },
  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:4329',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
