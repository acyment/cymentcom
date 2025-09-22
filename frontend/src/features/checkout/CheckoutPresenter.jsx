import React, { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

export function CheckoutPresenter({
  variant,
  open,
  onClose,
  title = 'Checkout',
  children,
}) {
  // Scroll lock only when modal is open
  useEffect(() => {
    if (variant === 'modal' && open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [variant, open]);

  // Radix Dialog handles Escape; no manual keydown handler needed.

  if (!open) return null;

  if (variant === 'fullscreen') {
    return (
      <div className="CheckoutFullscreen" data-testid="checkout-fullscreen">
        <header
          className="CheckoutMobileHeader"
          data-testid="checkout-mobile-header"
        >
          <button
            type="button"
            className="CheckoutMobileHeader__close"
            onClick={onClose}
            aria-label="Cerrar checkout"
          >
            ←
          </button>
        </header>
        <div className="CheckoutFullscreen__content">{children}</div>
      </div>
    );
  }

  return (
    <Dialog.Root
      open={open}
      modal
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className="DialogOverlay"
          data-testid="checkout-scrim"
        />
        <Dialog.Content
          className="DialogContent"
          aria-modal={true}
          aria-label={title}
          onInteractOutside={(e) => e.preventDefault()}
          style={{ maxHeight: '90dvh', overflow: 'auto' }}
        >
          <Dialog.Close asChild>
            <button
              type="button"
              className="close-button close-button--corner"
              aria-label="Close"
              title="Cerrar"
            >
              ×
            </button>
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
