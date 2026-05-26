import { test, expect } from '@playwright/test';

test('unauthenticated visit redirects to the login screen', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(page.getByRole('heading', { name: 'Matador Admin' })).toBeVisible();
});
