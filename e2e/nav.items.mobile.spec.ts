import { test, expect } from '@playwright/test';
import { hideDebugToolbar } from './support/actions';

test('mobile nav shows core links only', async ({ page }, ti) => {
  if (ti.project.name !== 'mobile') test.skip();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await hideDebugToolbar(page);

  const itemsText = await page.locator('nav a').allInnerTexts();
  const normalized = itemsText.map((t) => t.trim().toLowerCase());

  expect(normalized).toEqual(
    expect.arrayContaining(['inicio', 'cursos', 'cómo trabajo', 'contacto']),
  );
  expect(normalized).not.toEqual(
    expect.arrayContaining(['intervenciones', 'agilidad profunda']),
  );
});
