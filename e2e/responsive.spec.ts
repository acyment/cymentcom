import { test } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';

// Keep surface minimal but valuable; safely include products if available.
const routes = ['/', '/products'];

test.describe('No horizontal overflow', () => {
  for (const route of routes) {
    test(`page ${route} has no horizontal scrollbar`, async ({
      page,
    }, testInfo) => {
      const resp = await page.goto(route);
      // If the route is not served (e.g., 404 in this build), skip to avoid flakiness.
      if (resp && resp.status() >= 400) {
        test.skip(
          true,
          `Route ${route} not available (status ${resp.status()})`,
        );
      }
      await assertNoHOverflow(page);
    });
  }
});
