import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import HorarioCurso from '../HorarioCurso';

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));

const openCheckoutMock = vi.fn();

vi.mock('@/features/checkout/useOpenCheckout', () => ({
  useOpenCheckout: () => openCheckoutMock,
}));

vi.mock('intl-dateformat', () => ({
  __esModule: true,
  default: vi.fn(() => 'OCT'),
}));

const baseProps = {
  proximosCursos: [
    {
      id: 99,
      fecha: '2025-10-27T00:00:00.000Z',
      cantidad_dias: 5,
      hora_inicio: '09:00',
      hora_fin: '11:00',
    },
  ],
  nombreCorto: 'Test',
  costoUSD: 100,
  costoARS: 200,
};

describe('HorarioCurso SSR output', () => {
  it('includes month abbreviation and day on first render', () => {
    const html = renderToStaticMarkup(<HorarioCurso {...baseProps} />);
    expect(html).toContain('OCT');
    expect(html).toContain('27');
  });

  it('reserves calendar space by rendering explicit image dimensions', () => {
    const html = renderToStaticMarkup(<HorarioCurso {...baseProps} />);
    expect(html).toContain('width="157"');
    expect(html).toContain('height="169"');
  });
});
