import React from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useIsMobile } from '@/hooks/useIsMobile';
import { BP_MD } from '@/styles/breakpoints';
import { CheckoutPresenter } from '@/features/checkout/CheckoutPresenter';

export function CheckoutEntry({ title = 'Checkout', children }) {
  const isMobile = useIsMobile(`(max-width: ${BP_MD}px)`);
  const navigate = useNavigate();
  const location = useLocation();
  const rawSearch = location?.search ?? {};
  const search =
    typeof rawSearch === 'string'
      ? Object.fromEntries(new URLSearchParams(rawSearch))
      : rawSearch;

  const variant = isMobile ? 'fullscreen' : 'modal';
  const open = isMobile
    ? location?.pathname === '/checkout'
    : Boolean(search?.checkout);

  const handleClose = () => {
    if (isMobile) {
      navigate({ to: '/', replace: true });
    } else {
      navigate({ to: '/', search: {}, replace: true });
    }
  };

  const content =
    typeof children === 'function'
      ? children({ onClose: handleClose })
      : React.isValidElement(children)
        ? React.cloneElement(children, { onClose: handleClose })
        : children;

  return (
    <CheckoutPresenter
      variant={variant}
      open={open}
      onClose={handleClose}
      title={title}
    >
      {content}
    </CheckoutPresenter>
  );
}
