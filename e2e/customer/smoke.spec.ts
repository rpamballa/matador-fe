import { test, expect } from '@playwright/test';

test('customer shell renders home with bottom nav', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav.bottom-nav')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
});
