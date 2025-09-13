import { test, expect } from '@playwright/test';
import { openInscripcionForFirstCourse } from './support/actions';

test.describe('Inscripción dialog focus trap (mobile)', () => {
  test('focus remains inside dialog while open', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    const opened = await openInscripcionForFirstCourse(page);
    if (!opened) test.skip(true, 'No courses present');

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
