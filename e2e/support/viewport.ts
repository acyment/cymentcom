import type { Page } from '@playwright/test';

export async function assertNoHOverflow(page: Page): Promise<void> {
  const noHScroll = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  if (!noHScroll) {
    throw new Error('Horizontal overflow detected');
  }
}
