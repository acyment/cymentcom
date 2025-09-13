import { test, expect } from '@playwright/test';

test.describe('Inscripción dialog keyboard behavior (desktop)', () => {
  test('ESC closes dialog', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'desktop') test.skip();

    await page.goto('/');
    const items = page.locator('.ToggleResumenCurso');
    const count = await items.count();
    if (count === 0) test.skip(true, 'No courses present');

    await items.first().click();
    const trigger = page.getByRole('button', { name: /inscribirme/i });
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
});
