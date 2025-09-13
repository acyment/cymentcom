import { test, expect } from '@playwright/test';
import { hideDebugToolbar } from './support/actions';

test.describe('Hero CTA (mobile)', () => {
  test('shows a visible “Ver cursos” CTA that scrolls to courses', async ({
    page,
  }, ti) => {
    if (ti.project.name !== 'mobile') test.skip();
    await page.goto('/');
    await hideDebugToolbar(page);

    // Prefer button role; fall back to link if needed
    let cta = page.getByRole('button', { name: /ver cursos/i });
    if ((await cta.count()) === 0) {
      cta = page.getByRole('link', { name: /ver cursos/i });
    }
    await expect(cta).toBeVisible();

    // Click CTA and expect cursos section to be in view
    await cta.click();
    const inView = await page.locator('#cursos').evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.top >= 0 &&
        r.top < (window.innerHeight || document.documentElement.clientHeight)
      );
    });
    expect(inView).toBeTruthy();
  });
});
