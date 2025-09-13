import { test, expect } from '@playwright/test';
import { hideDebugToolbar } from './support/actions';

test('mobile nav shows core links only', async ({ page }, ti) => {
  if (ti.project.name !== 'mobile') test.skip();
  await page.goto('/');
  await hideDebugToolbar(page);

  const toggle = page.getByTestId('menu-toggle');
  await toggle.click();

  const itemsText = await page.locator('.MobileNavItem, nav a').allInnerTexts();
  const normalized = itemsText.map((t) => t.trim().toLowerCase());

  expect(normalized).toEqual(
    expect.arrayContaining(['inicio', 'cursos', 'contacto']),
  );
  expect(normalized).not.toEqual(
    expect.arrayContaining(['intervenciones', 'agilidad profunda']),
  );
});
