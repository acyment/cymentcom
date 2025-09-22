import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@tanstack/react-router', () => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: vi.fn(),
}));

import * as RouterHooks from '@tanstack/react-router';
import { useIsMobile as useIsMobileMock } from '@/hooks/useIsMobile';
import { CheckoutEntry } from '@/features/checkout/CheckoutEntry';

describe('CheckoutEntry variant + navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('desktop: shows modal when ?checkout=1; scrim click does not close; ESC closes', async () => {
    const navigate = vi.fn();
    useIsMobileMock.mockReturnValue(false);
    (RouterHooks.useLocation as any).mockReturnValue({
      pathname: '/',
      search: { checkout: 1 },
    });
    (RouterHooks.useNavigate as any).mockReturnValue(navigate);

    render(<CheckoutEntry title="Checkout" />);

    const dialog = await screen.findByRole('dialog', { name: /checkout/i });
    expect(dialog).toBeInTheDocument();

    // Scrim click should NOT close anymore
    await userEvent.click(screen.getByTestId('checkout-scrim'));
    expect(navigate).not.toHaveBeenCalled();

    // Visible close button closes
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(navigate).toHaveBeenCalledWith({
      to: '/',
      search: {},
      replace: true,
    });

    // Reset mock for next assertion
    navigate.mockReset();

    // ESC closes
    await userEvent.keyboard('{Escape}');
    expect(navigate).toHaveBeenCalledWith({
      to: '/',
      search: {},
      replace: true,
    });
  });

  it('mobile: shows fullscreen when path is /checkout and closes to /', async () => {
    const navigate = vi.fn();
    useIsMobileMock.mockReturnValue(true);
    (RouterHooks.useLocation as any).mockReturnValue({
      pathname: '/checkout',
      search: {},
    });
    (RouterHooks.useNavigate as any).mockReturnValue(navigate);

    render(<CheckoutEntry title="Checkout" />);

    expect(
      await screen.findByTestId('checkout-fullscreen'),
    ).toBeInTheDocument();

    // Click explicit mobile close button
    await userEvent.click(
      screen.getByRole('button', { name: /cerrar checkout/i }),
    );

    expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true });
  });
});
