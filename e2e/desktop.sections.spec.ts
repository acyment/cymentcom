import { test, expect } from '@playwright/test';

test.describe('Desktop sections: full homepage', () => {
  test('heavy sections are present on desktop', async ({ page }, ti) => {
    if (ti.project.name !== 'desktop') test.skip();
    await page.goto('/');

    await expect(page.locator('.IntervencionesAccordion')).toHaveCount(1);
    await expect(page.locator('.AgilidadProfundaAccordion')).toHaveCount(1);
    await expect(page.locator('.Clientes')).toHaveCount(1);
  });
});
