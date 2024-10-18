import { defineConfig } from '@playwright/test';

const serverOptions = {
  reuseExistingServer: !process.env.CI,
  stdout: 'ignore',
  stderr: 'pipe',
} as const;

export default defineConfig({
  projects: [
    {
      name: 'Default',
      testMatch: 'test/*.test.ts',
      testIgnore: [
        'test/*.override-components.test.ts',
        'test/*.lessons-in-part.test.ts',
        'test/*.lessons-in-root.test.ts',
      ],
      use: { baseURL: 'http://localhost:4329' },
    },
    {
      name: 'Override Components',
      testMatch: 'test/*.override-components.test.ts',
      use: { baseURL: 'http://localhost:4330' },
    },
    {
      name: 'Lessons in root',
      testMatch: 'test/*.lessons-in-root.test.ts',
      use: { baseURL: 'http://localhost:4331' },
    },
    {
      name: 'Lessons in part',
      testMatch: 'test/*.lessons-in-part.test.ts',
      use: { baseURL: 'http://localhost:4332' },
    },
  ],
  webServer: [
    {
      command: 'pnpm preview',
      url: 'http://localhost:4329',
      ...serverOptions,
    },
    {
      command: 'pnpm preview:override-components',
      url: 'http://localhost:4330',
      ...serverOptions,
    },
    {
      command: 'pnpm preview:lessons-in-root',
      url: 'http://localhost:4331',
      ...serverOptions,
    },
    {
      command: 'pnpm preview:lessons-in-part',
      url: 'http://localhost:4332',
      ...serverOptions,
    },
  ],
  expect: {
    timeout: process.env.CI ? 30_000 : 10_000,
  },
});
