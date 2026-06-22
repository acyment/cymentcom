import { test, expect } from '@playwright/test';

test.describe('Desktop sections: full homepage', () => {
  test('keeps current sections and omits removed ones', async ({
    page,
  }, ti) => {
    if (ti.project.name !== 'desktop') test.skip();
    await page.goto('/');

    await expect(page.locator('#cursos')).toHaveCount(0);
    await expect(page.locator('.IntervencionesAccordion')).toHaveCount(1);
    await expect(page.locator('.AgilidadProfundaAccordion')).toHaveCount(0);
    await expect(page.locator('.Clientes')).toHaveCount(1);
  });
});
