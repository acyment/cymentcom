import React from 'react';
import { Formik } from 'formik';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));
vi.mock('../../hooks/useIsMobile', () => ({ useIsMobile: vi.fn() }));

let StepParticipantes;
let useIsMobile;

const renderStep = () =>
  render(
    <Formik initialValues={{}} onSubmit={() => undefined}>
      <StepParticipantes idCurso="csm" />
    </Formik>,
  );

describe('StepParticipantes autofocus', () => {
  beforeAll(async () => {
    const module = await import('../StepParticipantes.jsx');
    StepParticipantes = module.default;
    useIsMobile = (await import('../../hooks/useIsMobile')).useIsMobile;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables autofocus on the first field for mobile', () => {
    useIsMobile.mockReturnValue(true);
    renderStep();
    const input = screen.getByLabelText(/nombre/i);
    expect(document.activeElement).not.toBe(input);
  });

  it('retains autofocus on desktop', async () => {
    useIsMobile.mockReturnValue(false);
    renderStep();
    const input = screen.getByLabelText(/nombre/i);
    await waitFor(() => expect(document.activeElement).toBe(input));
  });
});
