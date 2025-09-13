import { test, expect } from '@playwright/test';
import { openInscripcionForFirstCourse } from './support/actions';

test.describe('Inscripción dialog behavior (mobile)', () => {
  test('overlay tap closes and focus returns to trigger', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    const opened = await openInscripcionForFirstCourse(page);
    if (!opened) test.skip(true, 'No courses present');
    const trigger = (await page.getByTestId('inscripcion-open').count())
      ? page.getByTestId('inscripcion-open')
      : page.getByRole('button', { name: /inscribirme/i });

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const overlay = page.locator('.DialogOverlay');
    await expect(overlay).toBeVisible();
    await overlay.click({ position: { x: 5, y: 5 } });

    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('body scroll is locked while dialog is open', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    const opened2 = await openInscripcionForFirstCourse(page);
    if (!opened2) test.skip(true, 'No courses present');

    const overflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    expect(['hidden', 'clip']).toContain(overflow);

    // Close to restore
    await page.keyboard.press('Escape');
    const overflowAfter = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    expect(overflowAfter).not.toBe('hidden');
  });
});
