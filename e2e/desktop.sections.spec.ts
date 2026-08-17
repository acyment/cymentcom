import { test, expect } from '@playwright/test';

test.describe('Desktop sections: full homepage', () => {
  test('keeps current sections and omits removed ones', async ({
    page,
  }, ti) => {
    if (ti.project.name !== 'desktop') test.skip();
    await page.goto('/');

    await expect(page.locator('#cursos')).toHaveCount(1);
    await expect(page.locator('.ComoTrabajoSection')).toHaveCount(1);
    await expect(page.locator('.IntervencionesAccordion')).toHaveCount(0);
    await expect(page.locator('.AgilidadProfundaAccordion')).toHaveCount(0);

    // Clientes lives in the hero's Accordion.Content, which Radix only mounts
    // once expanded, so open the hero before asserting it renders.
    await expect(page.locator('.Clientes')).toHaveCount(0);
    await page.locator('#hero .CircleButton').click();
    await expect(page.locator('.Clientes')).toHaveCount(1);
  });
});
