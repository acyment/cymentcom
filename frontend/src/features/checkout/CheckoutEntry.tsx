import React from 'react';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { useIsMobile } from '@/hooks/useIsMobile';
import { BP_MD } from '@/styles/breakpoints';
import { CheckoutPresenter } from '@/features/checkout/CheckoutPresenter';

type Props = {
  title?: string;
  children?: React.ReactNode;
};

export function CheckoutEntry({ title = 'Checkout', children }: Props) {
  const isMobile = useIsMobile(`(max-width: ${BP_MD}px)`);
  const navigate = useNavigate();
  const location = useLocation();
  const search = useSearch({ from: '/' as any }) as any;

  const variant: 'modal' | 'fullscreen' = isMobile ? 'fullscreen' : 'modal';
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

  return (
    <CheckoutPresenter
      variant={variant}
      open={open}
      onClose={handleClose}
      title={title}
    >
      {children ?? null}
    </CheckoutPresenter>
  );
}
