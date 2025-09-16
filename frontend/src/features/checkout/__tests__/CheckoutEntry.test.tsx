import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@tanstack/react-router', () => ({
  useSearch: vi.fn(),
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

  it('desktop: shows modal when ?checkout=1 and closes by clearing the param', async () => {
    const navigate = vi.fn();
    useIsMobileMock.mockReturnValue(false);
    (RouterHooks.useSearch as any).mockReturnValue({ checkout: 1 });
    (RouterHooks.useLocation as any).mockReturnValue({ pathname: '/' });
    (RouterHooks.useNavigate as any).mockReturnValue(navigate);

    render(<CheckoutEntry title="Checkout" />);

    const dialog = await screen.findByRole('dialog', { name: /checkout/i });
    expect(dialog).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('checkout-scrim'));

    expect(navigate).toHaveBeenCalledWith({
      to: '/',
      search: {},
      replace: true,
    });
  });

  it('mobile: shows fullscreen when path is /checkout and closes to /', async () => {
    const navigate = vi.fn();
    useIsMobileMock.mockReturnValue(true);
    (RouterHooks.useLocation as any).mockReturnValue({ pathname: '/checkout' });
    (RouterHooks.useSearch as any).mockReturnValue({});
    (RouterHooks.useNavigate as any).mockReturnValue(navigate);

    render(<CheckoutEntry title="Checkout" />);

    expect(
      await screen.findByTestId('checkout-fullscreen'),
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true });
  });
});
