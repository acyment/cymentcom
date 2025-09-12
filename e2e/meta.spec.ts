import { test, expect } from '@playwright/test';

test.describe('Meta viewport', () => {
  test('mobile: page includes responsive viewport meta', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();
    await page.goto('/');

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);

    const content = await viewport.getAttribute('content');
    expect(content || '').toMatch(/width=device-width/i);
    expect(content || '').toMatch(/initial-scale=1/i);
  });
});
