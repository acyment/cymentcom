import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';
import { hideDebugToolbar } from './support/actions';

async function elWithinViewport(
  page,
  selector: string,
): Promise<boolean | null> {
  const count = await page.locator(selector).count();
  if (count === 0) return null;
  return await page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth || document.documentElement.clientWidth;
      return rect.width <= vw + 0.5;
    });
}

test.describe('Media responsiveness (mobile)', () => {
  test('hero/product/media elements fit viewport width', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    await page.goto('/');
    await hideDebugToolbar(page);
    await assertNoHOverflow(page);

    const checks: Array<[string, string]> = [
      ['Hero image', '.HeroImage'],
      ['Course card image', '.ImagenResumenCurso'],
      ['Video player', '.VideoPlayer'],
    ];

    for (const [name, selector] of checks) {
      const res = await elWithinViewport(page, selector);
      if (res === null) continue; // element not present on this build
      expect(res, `${name} exceeds viewport width`).toBeTruthy();
    }
  });
});
