import { test, expect } from '@playwright/test';
import { hideDebugToolbar } from './support/actions';

test.describe('Hero CTA Contacto (mobile)', () => {
  test('shows a visible “Contacto” CTA that scrolls to footer', async ({
    page,
  }, ti) => {
    if (ti.project.name !== 'mobile') test.skip();
    await page.goto('/');
    await hideDebugToolbar(page);

    let cta = page.getByRole('button', { name: /contacto/i });
    if ((await cta.count()) === 0) {
      cta = page.getByRole('link', { name: /contacto/i });
    }
    await expect(cta).toBeVisible();

    await cta.click();
    await page.waitForFunction(() => {
      const el = document.querySelector('#contacto');
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top >= -100 && r.top < vh;
    });
  });
});
