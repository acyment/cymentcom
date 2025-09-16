import React from 'react';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { useIsMobile } from '@/hooks/useIsMobile';
import { BP_MD } from '@/styles/breakpoints';
import { CheckoutPresenter } from '@/features/checkout/CheckoutPresenter';

export function CheckoutEntry({ title = 'Checkout', children }) {
  const isMobile = useIsMobile(`(max-width: ${BP_MD}px)`);
  const navigate = useNavigate();
  const location = useLocation();
  const search = useSearch({ from: '/' });

  const variant = isMobile ? 'fullscreen' : 'modal';
  const open = isMobile
    ? location?.pathname === '/checkout'
    : !!search?.checkout;

  const handleClose = () => {
    if (isMobile) {
      navigate({ to: '/', replace: true });
    } else {
      navigate({ to: '/', search: {}, replace: true });
    }
  };

  const mobileHeader = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 8 }}>
      <button type="button" aria-label="Close" onClick={handleClose}>
        Close
      </button>
    </div>
  );

  return (
    <CheckoutPresenter
      variant={variant}
      open={open}
      onClose={handleClose}
      title={title}
    >
      {isMobile ? mobileHeader : null}
      {children ?? null}
    </CheckoutPresenter>
  );
}
