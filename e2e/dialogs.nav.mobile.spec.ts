import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';
import { hideDebugToolbar } from './support/actions';

test.describe('Mobile nav dialog', () => {
  test('overlay closes and focus returns to toggle; no overflow while open', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    await page.goto('/');
    await hideDebugToolbar(page);

    let toggle = page.getByTestId('menu-toggle');
    if ((await toggle.count()) === 0) {
      toggle = page.getByRole('button', { name: /menu/i });
    }
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await assertNoHOverflow(page);

    const overlay = page.locator('.DialogOverlay');
    await expect(overlay).toBeVisible();
    await overlay.click({ position: { x: 5, y: 5 } });

    await expect(dialog).toHaveCount(0);
    await expect(toggle).toBeFocused();
  });

  test('focus remains inside nav dialog while open', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    await page.goto('/');
    await hideDebugToolbar(page);

    let toggle = page.getByTestId('menu-toggle');
    if ((await toggle.count()) === 0) {
      toggle = page.getByRole('button', { name: /menu/i });
    }
    await toggle.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const inside = async () =>
      await page.evaluate(() => {
        const content = document.querySelector('.DialogContent');
        return Boolean(content && content.contains(document.activeElement));
      });

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      expect(await inside()).toBeTruthy();
    }

    for (let i = 0; i < 5; i++) {
      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      await page.keyboard.up('Shift');
      expect(await inside()).toBeTruthy();
    }
  });
});
