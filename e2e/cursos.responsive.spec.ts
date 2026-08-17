import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';

test.describe('Cursos section responsiveness', () => {
  test('mobile: cursos has no horizontal overflow', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    await page.goto('/');

    const cursos = page.locator('#cursos');
    await expect(cursos).toHaveCount(1);
    await page.evaluate(() => {
      const el = document.querySelector('#cursos');
      el && el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await expect(cursos).toBeVisible();

    await assertNoHOverflow(page);

    const carousel = page.locator('.ResumenCursosCarousel');
    if (await carousel.count()) {
      const withinViewport = await carousel.evaluate(
        (el) => el.scrollWidth <= window.innerWidth,
      );
      expect(withinViewport).toBeTruthy();
    }
  });
});
