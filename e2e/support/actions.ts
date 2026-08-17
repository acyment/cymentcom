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

/**
 * Clicks the "Inscribirme" CTA within `scope`. The CTA only exists when the
 * course has upcoming dates, so this reports whether it was actually clicked.
 */
async function clickEnrollTrigger(scope: Page): Promise<boolean> {
  const byTestId = scope.getByTestId('inscripcion-open');
  const trigger = (await byTestId.count())
    ? byTestId
    : scope.getByRole('button', { name: /inscribirme/i });
  try {
    await trigger.first().click({ timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}

export async function openInscripcionForFirstCourse(
  page: Page,
): Promise<boolean> {
  await page.goto('/');
  await hideDebugToolbar(page);
  const cursos = page.locator('#cursos');
  await expect(cursos).toHaveCount(1);
  await page.evaluate(() => {
    const el = document.querySelector('#cursos');
    el && el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });

  // Desktop reaches checkout through the carousel + detail panel. The mobile
  // card -> "Inscribirme" path is covered on its own by cursos.cta.spec.ts, so
  // here we enter checkout directly on mobile to keep these specs fast.
  // The catalogue is fetched client-side, so wait for whichever layout renders
  // (waiting on the carousel alone would burn the whole timeout on mobile).
  // Keep this short: callers have a 30s budget and must still reach checkout
  // via the fallback below. cursos.cta.spec.ts covers the catalogue UI itself.
  const carouselItems = page.locator('.ToggleResumenCurso'); // desktop
  const cards = page.locator('.CourseCard'); // mobile
  await carouselItems
    .or(cards)
    .first()
    .waitFor({ state: 'visible', timeout: 8_000 })
    .catch(() => {});

  let clickedTrigger = false;
  if (await carouselItems.count()) {
    await carouselItems.first().click();
    await expect(page.locator('#detalle-curso')).toBeVisible();
    clickedTrigger = await clickEnrollTrigger(page);
  }

  if (!clickedTrigger) {
    // Mobile, no seeded courses, or no upcoming dates (so no enroll CTA is
    // rendered): enter checkout directly so the forms are still exercised.
    await page.goto(CHECKOUT_WITH_COURSE);
    await hideDebugToolbar(page);
  }

  // Support both desktop modal and mobile fullscreen routing
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
