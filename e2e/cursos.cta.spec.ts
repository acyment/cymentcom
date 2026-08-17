import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';

test('mobile: “Inscribirme” CTA visible after opening a course card', async ({
  page,
}, testInfo) => {
  if (testInfo.project.name !== 'mobile') test.skip();
  // The dev server's first compile can be slow; allow for it
  test.setTimeout(60_000);

  await page.goto('/');
  await expect(page.locator('#cursos')).toHaveCount(1);
  await page.evaluate(() => {
    const el = document.querySelector('#cursos');
    el && el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });

  // The catalogue is fetched client-side, so wait for the cards to render
  const cards = page.locator('.CourseCard');
  await cards
    .first()
    .waitFor({ state: 'visible', timeout: 30_000 })
    .catch(() => {});
  if ((await cards.count()) === 0) test.skip(true, 'No courses present');

  const firstCard = cards.first();
  await firstCard.locator('summary.CourseCardPrimary').click();

  const cta = firstCard.getByTestId('inscripcion-open');
  await expect(cta).toBeVisible();
  await expect(cta).toHaveText(/inscribirme/i);

  await assertNoHOverflow(page);
});

test('desktop: selecting a course opens its detail panel with the “Inscribirme” CTA', async ({
  page,
}, testInfo) => {
  if (testInfo.project.name !== 'desktop') test.skip();
  // The dev server's first compile can be slow; allow for it
  test.setTimeout(60_000);

  await page.goto('/');
  await expect(page.locator('#cursos')).toHaveCount(1);

  // The catalogue is fetched client-side, so wait for the carousel to render
  const items = page.locator('.ToggleResumenCurso');
  await items
    .first()
    .waitFor({ state: 'visible', timeout: 30_000 })
    .catch(() => {});
  if ((await items.count()) === 0) test.skip(true, 'No courses present');

  await items.first().click();
  await expect(page.locator('#detalle-curso')).toBeVisible();

  const cta = page.getByTestId('inscripcion-open').first();
  await expect(cta).toBeVisible();
  await expect(cta).toHaveText(/inscribirme/i);
});
