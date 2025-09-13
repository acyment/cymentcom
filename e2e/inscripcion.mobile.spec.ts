import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';

test.describe('Inscripción dialog (mobile)', () => {
  test('opens via Inscribirme and closes via close button without overflow', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    await page.goto('/');

    const cursos = page.locator('#cursos');
    await cursos.scrollIntoViewIfNeeded();
    await expect(cursos).toBeVisible();

    const items = page.locator('.ToggleResumenCurso');
    const count = await items.count();
    if (count === 0) test.skip(true, 'No courses present');

    await items.first().click();
    await expect(page.locator('#detalle-curso')).toBeVisible();

    await assertNoHOverflow(page);

    const trigger = page.getByRole('button', { name: /inscribirme/i });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Prefer explicit close control on mobile
    const closeBtn = page.getByRole('button', { name: /cerrar|close/i });
    await expect(closeBtn).toBeVisible();
    await assertNoHOverflow(page);
    await closeBtn.click();

    await expect(dialog).toHaveCount(0);
    await assertNoHOverflow(page);
  });
});
