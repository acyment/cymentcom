import { expect, type Page } from '@playwright/test';

const CHECKOUT_WITH_COURSE =
  '/checkout?checkout=1&idCurso=1&nombreCorto=Agilidad&costoUSD=100';

export async function hideDebugToolbar(page: Page): Promise<void> {
  const hideBtn = page.locator('#djHideToolBarButton');
  if (await hideBtn.count()) {
    try {
      await hideBtn.click({ timeout: 1000 });
    } catch {}
  }
}

export async function openInscripcionForFirstCourse(
  page: Page,
): Promise<boolean> {
  await page.goto(CHECKOUT_WITH_COURSE);
  await hideDebugToolbar(page);

  const dialog = page.getByRole('dialog');
  const fullscreen = page.getByTestId('checkout-fullscreen');
  const fieldNombre = page.getByLabel('Nombre*');
  const opened = await Promise.race([
    dialog
      .waitFor({ state: 'visible' })
      .then(() => true)
      .catch(() => false),
    fullscreen
      .waitFor({ state: 'visible' })
      .then(() => true)
      .catch(() => false),
    fieldNombre
      .waitFor({ state: 'visible' })
      .then(() => true)
      .catch(() => false),
  ]);
  return !!opened;
}
