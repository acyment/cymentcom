import React from 'react';
import { Formik } from 'formik';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    capture: vi.fn(),
    identify: vi.fn(),
    people: { set: vi.fn() },
  }),
}));
vi.mock('react-formik-step-wizard', () => ({
  useWizard: () => ({
    goToPreviousStep: vi.fn(),
    values: {},
    activeStep: null,
  }),
}));
vi.mock('@formkit/auto-animate/react', () => ({
  useAutoAnimate: () => [() => undefined, () => undefined, () => undefined],
}));

describe('StepFacturacion fiscal fields', () => {
  let StepFacturacion;

  const renderStep = (initialValues) =>
    render(
      <Formik initialValues={initialValues} onSubmit={vi.fn()}>
        <StepFacturacion idCurso="demo" />
      </Formik>,
    );

  beforeAll(async () => {
    StepFacturacion = (await import('../StepFacturacion.jsx')).default;
  });

  it('shows Argentina-specific fiscal inputs when the country is AR', () => {
    renderStep({
      nombreCompleto: '',
      email: '',
      pais: 'AR',
      direccion: '',
      tipoIdentificacionFiscal: '',
      identificacionFiscal: '',
      tipoFactura: 'B',
    });

    expect(screen.getByLabelText(/Tipo ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número identificación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo factura/i)).toBeInTheDocument();
  });

  it('shows the generic fiscal identification field for non-Argentina countries', () => {
    renderStep({
      nombreCompleto: '',
      email: '',
      pais: 'US',
      direccion: '',
      tipoIdentificacionFiscal: '',
      identificacionFiscal: '',
      tipoFactura: 'B',
    });

    expect(screen.getByLabelText(/Identificación$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Tipo ID/i)).toBeNull();
    expect(screen.queryByLabelText(/Tipo factura/i)).toBeNull();
  });
});
