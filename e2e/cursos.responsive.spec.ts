import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';

test.describe('Cursos section removal', () => {
  test('mobile: cursos section is absent without horizontal overflow', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    await page.goto('/');

    await expect(page.locator('#cursos')).toHaveCount(0);
    await expect(page.locator('.ResumenCursosCarousel')).toHaveCount(0);
    await assertNoHOverflow(page);
  });
});
