import { test, expect } from '@playwright/test';
import { hideDebugToolbar } from './support/actions';
import { assertNoHOverflow } from './support/viewport';

test.describe('Mobile sections: slimmed homepage', () => {
  test('keeps core sections, removes heavy ones', async ({ page }, ti) => {
    if (ti.project.name !== 'mobile') test.skip();
    await page.goto('/');
    await hideDebugToolbar(page);

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('#cursos')).toBeVisible();
    await expect(page.locator('#contacto')).toBeVisible();

    await expect(page.locator('.IntervencionesAccordion')).toHaveCount(0);
    await expect(page.locator('.AgilidadProfundaAccordion')).toHaveCount(0);
    await expect(page.locator('.Clientes')).toHaveCount(0);
    await expect(page.locator('.VideoPlayer, mux-player')).toHaveCount(0);

    await assertNoHOverflow(page);
  });
});
