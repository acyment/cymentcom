import { test, expect } from '@playwright/test';
import { assertNoHOverflow } from './support/viewport';
import { openInscripcionForFirstCourse } from './support/actions';

test.describe('Checkout forms (mobile)', () => {
  test('StepParticipantes: shows errors then proceeds on valid input', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    const opened = await openInscripcionForFirstCourse(page);
    if (!opened) test.skip(true, 'No courses present');
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

  test('StepFacturacion (AR): requires extra fields; submit enabled after fill; no overflow', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'mobile') test.skip();

    const opened2 = await openInscripcionForFirstCourse(page);
    if (!opened2) test.skip(true, 'No courses present');

    // Complete StepParticipantes quickly
    await page.getByLabel('Nombre*').fill('Ada');
    await page.getByLabel('Apellido*').fill('Lovelace');
    await page.getByLabel('E-mail*').fill('ada@example.com');
    await page.getByRole('button', { name: /^continuar$/i }).click();
    await expect(page.getByText(/Datos para facturación/i)).toBeVisible();

    await assertNoHOverflow(page);

    // Pick Argentina to trigger AR-required fields
    await page.getByLabel('País*').selectOption('AR');

    // Try to submit without required AR fields → errors should appear
    const submit = page.getByRole('button', { name: /^continuar$/i });
    await submit.click();

    await expect(
      page.getByText(/No te olvides de la dirección/i),
    ).toBeVisible();
    await expect(
      page.getByText(/tipo de identificación fiscal/i),
    ).toBeVisible();
    await expect(page.getByText(/tu identificación fiscal/i)).toBeVisible();
    await expect(page.getByText(/elegir el tipo de factura/i)).toBeVisible();

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
