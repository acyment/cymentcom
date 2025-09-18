import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';

vi.mock('@tanstack/react-router-devtools', () => ({
  TanStackRouterDevtools: () => null,
}));

vi.mock('@/components/App', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="app-shell">{children}</div>,
}));

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: vi.fn(),
}));

vi.mock('@radix-ui/react-accordion', () => ({
  __esModule: true,
  Root: ({ children }) => <div data-testid="accordion-root">{children}</div>,
}));

vi.mock('@/components/Hero', () => ({
  __esModule: true,
  default: () => <div data-testid="hero">Hero</div>,
}));

vi.mock('@/components/Cursos', () => ({
  __esModule: true,
  default: () => <div data-testid="cursos">Cursos</div>,
}));

vi.mock('@/components/Intervenciones', () => ({
  __esModule: true,
  default: () => <div data-testid="intervenciones">Intervenciones</div>,
}));

vi.mock('@/components/AgilidadProfunda', () => ({
  __esModule: true,
  default: () => <div data-testid="agilidad">Agilidad</div>,
}));

vi.mock('@/features/checkout/CheckoutFlow', () => {
  const CheckoutFlow = ({ onClose }) => (
    <div data-testid="checkout-flow">
      Checkout Flow<button onClick={onClose}>Close</button>
    </div>
  );
  return {
    __esModule: true,
    CheckoutFlow,
    default: CheckoutFlow,
  };
});

import { routeTree } from '@/routes/routes';
import { useIsMobile } from '@/hooks/useIsMobile';

describe('Checkout routing integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a dedicated fullscreen page on mobile /checkout without the sections layout', async () => {
    useIsMobile.mockReturnValue(true);

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: [
          '/checkout?idCurso=1&nombreCorto=Agilidad&costoUSD=100',
        ],
      }),
    });

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByTestId('checkout-fullscreen'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('accordion-root')).not.toBeInTheDocument();
  });

  it('keeps the sections layout and modal variant on desktop with ?checkout=1', async () => {
    useIsMobile.mockReturnValue(false);

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: [
          '/?checkout=1&idCurso=1&nombreCorto=Agilidad&costoUSD=100',
        ],
      }),
    });

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole('dialog', { name: /checkout/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('accordion-root')).toBeInTheDocument();
  });
});
