import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';

test('mobile: “Inscribirme” CTA visible after selecting a course', async ({
  page,
}, testInfo) => {
  if (testInfo.project.name !== 'mobile') test.skip();

  await page.goto('/');
  await expect(page.locator('#cursos')).toHaveCount(1);
  await page.evaluate(() => {
    const el = document.querySelector('#cursos');
    el && el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });

  const items = page.locator('.ToggleResumenCurso');
  const count = await items.count();
  if (count === 0) test.skip(true, 'No courses present');

  await items.first().click();
  await expect(page.locator('#detalle-curso')).toBeVisible();

  const cta = page.getByRole('button', { name: /inscribirme/i });
  await expect(cta).toBeVisible();

  await assertNoHOverflow(page);
});
