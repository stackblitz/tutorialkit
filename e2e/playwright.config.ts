import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'Default',
      testMatch: 'test/*.test.ts',
      testIgnore: 'test/*.override-components.test.ts',
      use: { baseURL: 'http://localhost:4329' },
    },
    {
      name: 'Override Components',
      testMatch: 'test/*.override-components.test.ts',
      use: { baseURL: 'http://localhost:4330' },
    },
  ],
  webServer: [
    {
      command: 'pnpm preview',
      url: 'http://localhost:4329',
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'pnpm preview:override-components',
      url: 'http://localhost:4330',
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
  expect: {
    timeout: process.env.CI ? 30_000 : 10_000,
  },
});
