import React, { useEffect, useCallback } from 'react';

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

  const handleKeyDown = useCallback(
    (e) => {
      if (variant === 'modal' && open && e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    },
    [variant, open, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
            ←<span className="CheckoutMobileHeader__label">Cerrar</span>
          </button>
        </header>
        <div className="CheckoutFullscreen__content">{children}</div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        data-testid="checkout-scrim"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: '#fff',
          maxHeight: '90dvh',
          width: 'min(720px, 96vw)',
          borderRadius: 12,
          overflow: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
