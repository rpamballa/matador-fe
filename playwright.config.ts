import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config with separate suites per app. Each project runs against its own
 * dev server. CI runs headless; locally you can pass --headed.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: 'html',
  projects: [
    {
      name: 'admin',
      testDir: './e2e/admin',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4201' },
    },
    {
      name: 'customer',
      testDir: './e2e/customer',
      use: { ...devices['Pixel 7'], baseURL: 'http://localhost:4200' },
    },
  ],
});
