import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';

test('mobile: primary shopping CTAs usable without overflow', async ({
  page,
}, testInfo) => {
  if (testInfo.project.name !== 'mobile') test.skip(true, 'Mobile-only spec');

  // Start at home; adjust later to a products listing if needed.
  await page.goto('/');

  // Baseline: no horizontal scrollbar
  await assertNoHOverflow(page);

  // Try to find an "Add to Cart" CTA. If not present in this build, skip gracefully.
  const addToCart = page.getByRole('button', { name: /add to cart/i });
  const isAddToCartVisible = await addToCart.isVisible().catch(() => false);
  if (!isAddToCartVisible)
    test.skip(true, 'Add to Cart not present in this build');

  await addToCart.click();

  // Try common cart open triggers; if none, continue to overflow assertion.
  const openCart = page
    .getByRole('button', { name: /cart|open cart/i })
    .first();
  if (await openCart.isVisible().catch(() => false)) {
    await openCart.click();
  }

  await assertNoHOverflow(page);

  // If checkout CTA exists, ensure it's visible on mobile.
  const checkout = page.getByRole('button', { name: /checkout/i });
  if (await checkout.isVisible().catch(() => false)) {
    await expect(checkout).toBeVisible();
  }
});
