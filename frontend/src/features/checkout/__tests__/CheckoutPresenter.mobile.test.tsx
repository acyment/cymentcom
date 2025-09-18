import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

let CheckoutPresenter;

describe('CheckoutPresenter mobile chrome', () => {
  beforeAll(async () => {
    CheckoutPresenter = (await import('../CheckoutPresenter.jsx'))
      .CheckoutPresenter;
  });

  it('renders the mobile header without the legacy “Close” button', () => {
    const onClose = vi.fn();

    render(
      <CheckoutPresenter
        variant="fullscreen"
        open
        title="Checkout"
        onClose={onClose}
      >
        <div>Form</div>
      </CheckoutPresenter>,
    );

    expect(screen.getByTestId('checkout-mobile-header')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cerrar checkout/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /close/i }),
    ).not.toBeInTheDocument();
  });
});
