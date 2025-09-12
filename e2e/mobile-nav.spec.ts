import { test, expect } from '@playwright/test';

test.describe('Mobile navigation', () => {
  test('hamburger toggles nav and ESC closes', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();
    await page.goto('/');

    const toggle = page.getByRole('button', { name: /menu/i }).first();
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
