import { test, expect } from '@playwright/test';
import { openInscripcionForFirstCourse } from './support/actions';

test.describe('Inscripción dialog keyboard behavior (desktop)', () => {
  test('ESC closes dialog', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'desktop') test.skip();

    const opened = await openInscripcionForFirstCourse(page);
    if (!opened) test.skip(true, 'No courses present');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
});
