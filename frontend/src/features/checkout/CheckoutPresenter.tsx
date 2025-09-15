import React, { useEffect } from 'react';

export type CheckoutPresenterProps = {
  variant: 'modal' | 'fullscreen';
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

// Minimal stub that will intentionally fail tests until we implement behavior.
export function CheckoutPresenter({
  variant,
  open,
  onClose,
  title,
  children,
}: CheckoutPresenterProps) {
  useEffect(() => {
    // no-op for now; tests will expect scroll lock on modal
  }, [variant, open]);

  if (!open) return null;

  if (variant === 'fullscreen') {
    return <div data-testid="checkout-fullscreen">{children}</div>;
  }

  // Modal variant currently missing required semantics on purpose
  return <div>{children}</div>;
}
