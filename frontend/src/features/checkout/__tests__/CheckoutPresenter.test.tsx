import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CheckoutPresenter } from '@/features/checkout/CheckoutPresenter';

const getBodyOverflow = () => window.getComputedStyle(document.body).overflow;

describe('CheckoutPresenter', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders modal variant with dialog semantics and locks scroll', () => {
    render(
      <CheckoutPresenter
        variant="modal"
        open
        onClose={onClose}
        title="Checkout"
      >
        <h1>Checkout</h1>
      </CheckoutPresenter>,
    );

    const dialog = screen.getByRole('dialog', { name: /checkout/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // scrim click closes
    fireEvent.click(screen.getByTestId('checkout-scrim'));
    expect(onClose).toHaveBeenCalledTimes(1);

    // body scroll locked
    expect(getBodyOverflow()).toBe('hidden');
  });

  it('closes on ESC only in modal variant', () => {
    render(
      <CheckoutPresenter
        variant="modal"
        open
        onClose={onClose}
        title="Checkout"
      />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders fullscreen variant without dialog semantics and no scroll lock', () => {
    render(
      <CheckoutPresenter
        variant="fullscreen"
        open
        onClose={onClose}
        title="Checkout"
      >
        <h1>Checkout</h1>
      </CheckoutPresenter>,
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByTestId('checkout-fullscreen')).toBeInTheDocument();

    // body scroll not locked
    expect(getBodyOverflow()).not.toBe('hidden');
  });
});
