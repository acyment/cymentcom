import React from 'react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';

// Silence devtools in tests
vi.mock('@tanstack/react-router-devtools', () => ({
  TanStackRouterDevtools: () => null,
}));

// Control mobile/desktop behavior
vi.mock('@/hooks/useIsMobile', () => ({ useIsMobile: vi.fn() }));
import { useIsMobile } from '@/hooks/useIsMobile';

import { routeTree } from '@/routes/routes';

describe('PaymentResult routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mobile: renders payment result as fullscreen (no site header) and shows success UI', async () => {
    (useIsMobile as unknown as vi.Mock).mockReturnValue(true);

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: [
          '/payment-result?status=approved&nombre_participante=Ana&nombre_curso=Curso&fecha_curso=2025-01-01&monto=USD%2099.99',
        ],
      }),
    });

    render(<RouterProvider router={router} />);

    // Fullscreen on mobile => site header (banner) should be absent
    expect(screen.queryByRole('banner')).toBeNull();
    // Confirmation UI should be visible
    expect(await screen.findByText('¡Pago Exitoso!')).toBeInTheDocument();
  });

  it('desktop: keeps site header and shows dialog with confirmation UI', async () => {
    (useIsMobile as unknown as vi.Mock).mockReturnValue(false);

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: [
          '/payment-result?status=approved&nombre_participante=Ana&nombre_curso=Curso&fecha_curso=2025-01-01&monto=USD%2099.99',
        ],
      }),
    });

    render(<RouterProvider router={router} />);

    // Desktop keeps header
    expect(await screen.findByRole('banner')).toBeInTheDocument();
    // And shows a dialog
    expect(
      await screen.findByRole('dialog', { name: /resultado de pago/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText('¡Pago Exitoso!')).toBeInTheDocument();
  });
});
