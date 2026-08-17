import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';
import { openInscripcionForFirstCourse } from './support/actions';

test.describe('Checkout forms (mobile)', () => {
  // These drive the full catalogue → checkout → multi-step form flow against
  // the dev server and land around 20s each, leaving no headroom under the
  // default 30s when the suite runs 5 workers wide.
  test.describe.configure({ timeout: 60_000 });

  test('StepParticipantes: shows errors then proceeds on valid input', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    const opened = await openInscripcionForFirstCourse(page);
    if (!opened) test.skip(true, 'Checkout did not open');
    await assertNoHOverflow(page);

    // Attempt to continue without filling fields
    await page.getByRole('button', { name: /continuar/i }).click();

    // Required-field errors appear
    await expect(page.getByText(/No te olvides del nombre/i)).toBeVisible();
    await expect(page.getByText(/No te olvides del apellido/i)).toBeVisible();
    await expect(page.getByText(/No te olvides del e-mail/i)).toBeVisible();

    // Fill valid participant data
    await page.getByLabel('Nombre*').fill('Ada');
    await page.getByLabel('Apellido*').fill('Lovelace');
    await page.getByLabel('E-mail*').fill('ada@example.com');

    // Continue to billing step
    await page.getByRole('button', { name: /^continuar$/i }).click();
    await expect(page.getByText(/Datos para facturación/i)).toBeVisible();

    await assertNoHOverflow(page);
  });

  test('StepParticipantes: tapping Continuar from a focused field still submits', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    const opened = await openInscripcionForFirstCourse(page);
    if (!opened) test.skip(true, 'Checkout did not open');

    // Regression: with a field focused, tapping Continuar blurs it and renders
    // that field's error. If showing the error reflows the form, the button
    // moves between pointerdown and pointerup and the tap is swallowed, so the
    // submit handler never runs and only one error ever appears. The error row
    // is reserved in CSS precisely so this cannot happen.
    await page.getByLabel('Nombre*').click();
    await page.getByRole('button', { name: /^continuar$/i }).click();

    // All three errors present ⇒ the handler ran, i.e. the tap was not lost
    await expect(page.getByText(/No te olvides del nombre/i)).toBeVisible();
    await expect(page.getByText(/No te olvides del apellido/i)).toBeVisible();
    await expect(page.getByText(/No te olvides del e-mail/i)).toBeVisible();

    await assertNoHOverflow(page);
  });

  test('StepFacturacion (AR): requires extra fields; submit enabled after fill; no overflow', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    const opened2 = await openInscripcionForFirstCourse(page);
    if (!opened2) test.skip(true, 'Checkout did not open');

    // Complete StepParticipantes quickly
    await page.getByLabel('Nombre*').fill('Ada');
    await page.getByLabel('Apellido*').fill('Lovelace');
    await page.getByLabel('E-mail*').fill('ada@example.com');
    await page.getByRole('button', { name: /^continuar$/i }).click();
    await expect(page.getByText(/Datos para facturación/i)).toBeVisible();

    await assertNoHOverflow(page);

    // Pick Argentina to trigger AR-required fields
    await page.getByLabel('País*').selectOption('AR');

    // Try to submit without required AR fields → every error should appear
    const submit = page.getByRole('button', { name: /^continuar$/i });
    await submit.click();

    await expect(
      page.getByText(/No te olvides de la dirección/i),
    ).toBeVisible();
    await expect(
      page.getByText(/tipo de identificación fiscal/i),
    ).toBeVisible();
    await expect(page.getByText(/tu identificación fiscal/i)).toBeVisible();
    // No "tipo de factura" error: that field is disabled until an ID type of
    // CUIT is chosen, and is auto-set to 'B' meanwhile, so it is never empty.

    // Fill required AR fields
    await page.getByLabel('Nombre completo*').fill('Ada Lovelace');
    const emailBilling = page.getByLabel('Email*');
    if (!(await emailBilling.inputValue())) {
      await emailBilling.fill('ada@example.com');
    }
    await page.getByLabel('Dirección*').fill('Av. Siempre Viva 123');
    await page.getByLabel('Tipo ID*').selectOption('CUIT');
    await page.getByLabel('Número identificación*').fill('20-12345678-9');
    await page.getByLabel('Tipo factura*').selectOption('A');

    // Submit becomes enabled (we do not click it to avoid external submission)
    await expect(submit).toBeEnabled();

    await assertNoHOverflow(page);
  });
});
