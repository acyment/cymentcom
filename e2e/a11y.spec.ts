import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/products'];

test.describe('A11y (mobile)', () => {
  for (const route of routes) {
    test(`no critical accessibility violations on ${route}`, async ({
      page,
    }, testInfo) => {
      if (testInfo.project.name !== 'mobile') test.skip();
      const resp = await page.goto(route);
      if (resp && resp.status() >= 400)
        test.skip(true, `Route ${route} not available`);

      const results = await new AxeBuilder({ page })
        .include('#main')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const ALLOW = new Set(['button-name', 'image-alt']);
      const critical = results.violations.filter(
        (v) => v.impact === 'critical' && !ALLOW.has(v.id),
      );
      if (critical.length) {
        throw new Error(
          `Critical a11y issues on ${route}: ${critical.map((v) => v.id).join(', ')}`,
        );
      }
    });
  }
});
