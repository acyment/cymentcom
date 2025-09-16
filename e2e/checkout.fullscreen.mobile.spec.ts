import { test, expect } from '@playwright/test';

test.describe('Checkout (mobile fullscreen)', () => {
  test('opens via /checkout and shows participant fields', async ({
    page,
  }, ti) => {
    if (ti.project.name !== 'mobile') test.skip();
    const search = new URLSearchParams({
      idCurso: '1',
      nombreCorto: 'Curso',
      costoUSD: '99.99',
      costoARS: '85000',
    }).toString();
    await page.goto('/checkout?' + search);
    await expect(page.getByTestId('checkout-fullscreen')).toBeVisible();
    await expect(page.getByLabel('Nombre*')).toBeVisible();
  });
});
