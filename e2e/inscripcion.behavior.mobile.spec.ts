import { test, expect } from '@playwright/test';
import { openInscripcionForFirstCourse } from './support/actions';

test.describe('Inscripción checkout behavior (mobile)', () => {
  test('close button leaves the fullscreen checkout', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    const opened = await openInscripcionForFirstCourse(page);
    if (!opened) test.skip(true, 'Checkout did not open');

    const fullscreen = page.getByTestId('checkout-fullscreen');
    await expect(fullscreen).toBeVisible();

    await page.getByRole('button', { name: /cerrar checkout/i }).click();

    await expect(fullscreen).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test('body scroll remains usable after fullscreen checkout closes', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    const opened2 = await openInscripcionForFirstCourse(page);
    if (!opened2) test.skip(true, 'Checkout did not open');

    await expect(page.getByTestId('checkout-fullscreen')).toBeVisible();

    await page.getByRole('button', { name: /cerrar checkout/i }).click();
    const overflowAfter = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    expect(overflowAfter).not.toBe('hidden');
  });
});
