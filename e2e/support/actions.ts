import { expect, type Page } from '@playwright/test';

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
  await page.goto('/');
  await hideDebugToolbar(page);
  const cursos = page.locator('#cursos');
  await cursos.scrollIntoViewIfNeeded();
  const items = page.locator('.ToggleResumenCurso');
  if ((await items.count()) === 0) return false; // caller should handle skip
  await items.first().click();
  await expect(page.locator('#detalle-curso')).toBeVisible();
  const trigger = (await page.getByTestId('inscripcion-open').count())
    ? page.getByTestId('inscripcion-open')
    : page.getByRole('button', { name: /inscribirme/i });
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  return true;
}
