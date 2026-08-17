import { test, expect } from '@playwright/test';

test.describe('Checkout (desktop modal)', () => {
  test('opens via query param and shows participant fields', async ({
    page,
  }, ti) => {
    if (ti.project.name !== 'desktop') test.skip();
    // Open with required params so the flow renders real Inscripcion
    const search = new URLSearchParams({
      checkout: '1',
      idCurso: '1',
      nombreCorto: 'Curso',
      costoUSD: '99.99',
      costoARS: '85000',
    }).toString();
    await page.goto('/?' + search);

    // Modal present
    await expect(page.getByRole('dialog', { name: /checkout/i })).toBeVisible();
    // First step field visible
    await expect(page.getByLabel('Nombre*')).toBeVisible();

    // Clicking the scrim must NOT dismiss: CheckoutPresenter prevents
    // interact-outside so a stray click cannot discard checkout data.
    await page
      .getByTestId('checkout-scrim')
      .click({ position: { x: 5, y: 5 } });
    await expect(page.getByRole('dialog', { name: /checkout/i })).toBeVisible();

    // The explicit close control does dismiss it
    await page.getByRole('button', { name: /^close$/i }).click();
    await expect(page.getByRole('dialog').first()).toBeHidden({
      timeout: 2000,
    });
  });
});
