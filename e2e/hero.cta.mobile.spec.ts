import { test, expect } from '@playwright/test';
import { hideDebugToolbar } from './support/actions';

test.describe('Hero CTA (mobile)', () => {
  test('shows a visible LinkedIn CTA with the public profile URL', async ({
    page,
  }, ti) => {
    if (ti.project.name !== 'mobile') test.skip();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await hideDebugToolbar(page);

    const cta = page.locator('.HeroCTARow').getByRole('link', {
      name: /^linkedin$/i,
    });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/alancyment/',
    );
  });
});
