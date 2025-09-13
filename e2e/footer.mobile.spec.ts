import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';
import { hideDebugToolbar } from './support/actions';

test.describe('Footer/Contacto (mobile)', () => {
  test('footer visible and no overflow at bottom', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    await page.goto('/');
    await hideDebugToolbar(page);

    const contacto = page.locator('#contacto');
    if ((await contacto.count()) === 0)
      test.skip(true, 'Footer/Contacto not present');

    await contacto.scrollIntoViewIfNeeded();
    await expect(contacto).toBeVisible();

    const links = contacto.getByRole('link');
    await expect(links.first()).toBeVisible();

    await assertNoHOverflow(page);
  });
});
