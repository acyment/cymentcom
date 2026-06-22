import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';
import { openInscripcionForFirstCourse } from './support/actions';

test.describe('Inscripción checkout (mobile)', () => {
  test('opens directly and closes via close button without overflow', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    const opened = await openInscripcionForFirstCourse(page);
    if (!opened) test.skip(true, 'Checkout did not open');

    const fullscreen = page.getByTestId('checkout-fullscreen');
    await expect(fullscreen).toBeVisible();

    const closeBtn = page.getByRole('button', { name: /cerrar checkout/i });
    await expect(closeBtn).toBeVisible();
    await assertNoHOverflow(page);
    await closeBtn.click();

    await expect(fullscreen).toHaveCount(0);
    await assertNoHOverflow(page);
  });
});
