import React from 'react';
import { vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => new Promise(() => {})),
  },
}));

vi.mock('react-spinners/CircleLoader', () => ({
  default: () => <div data-testid="circle-loader" />,
}));

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    capture: vi.fn(),
  }),
}));

vi.mock('@/features/checkout/useOpenCheckout', () => ({
  useOpenCheckout: () => vi.fn(),
}));

vi.mock('keen-slider/react', () => ({
  useKeenSlider: () => [() => {}, null],
}));

import { render, screen } from '@/tests/utils';
import Cursos from './Cursos';

describe('Cursos loader', () => {
  it('renders the circle loader while data is still loading', () => {
    render(<Cursos />);
    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
  });

  it('renders the “Cargando...” legend beneath the loader', () => {
    render(<Cursos />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });
});
