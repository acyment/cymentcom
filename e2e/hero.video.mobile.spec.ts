import { test, expect } from '@playwright/test';
import { hideDebugToolbar } from './support/actions';

test('hero video loads only on demand', async ({ page }, ti) => {
  if (ti.project.name !== 'mobile') test.skip();
  await page.goto('/');
  await hideDebugToolbar(page);

  await expect(page.locator('.VideoPlayer, mux-player')).toHaveCount(0);

  const watch = page.getByRole('button', { name: /ver video/i });
  if (await watch.count()) {
    await watch.click();
    await expect(page.locator('.VideoPlayer, mux-player')).toHaveCount(1);
  }
});
