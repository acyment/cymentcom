import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';

test('mobile: removed cursos CTA is absent', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'mobile') test.skip();

  await page.goto('/');

  await expect(page.locator('#cursos')).toHaveCount(0);
  await expect(page.locator('.ToggleResumenCurso')).toHaveCount(0);
  await expect(page.locator('#detalle-curso')).toHaveCount(0);
  await assertNoHOverflow(page);
});
