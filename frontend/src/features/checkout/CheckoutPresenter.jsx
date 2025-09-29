import React, { useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import ArrowLeftIcon from 'lucide-react/dist/esm/icons/arrow-left.js';

export function CheckoutPresenter({
  variant,
  open,
  onClose,
  title = 'Checkout',
  children,
}) {
  // Intercept internal Tab traversal and perform focus move programmatically
  // to avoid FocusScope's occasional containment fallback.
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
    // Ensure the viewport is at the top on open without stealing focus from the first field.
    // Defer until after initial autofocus runs; only scroll if nothing is focused.
    useEffect(() => {
      const deferTwice = (fn) =>
        requestAnimationFrame(() => requestAnimationFrame(fn));
      deferTwice(() => {
        try {
          const root =
            document.querySelector('.CheckoutFullscreen__content') || document;
          const firstField = root.querySelector(
            'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])',
          );
          if (firstField && typeof firstField.focus === 'function') {
            firstField.focus({ preventScroll: true });
          }
          if (window.scrollY !== 0) {
            window.scrollTo({ top: 0, behavior: 'auto' });
          }
        } catch {}
      });
    }, []);
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
            <ArrowLeftIcon aria-hidden="true" />
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
          onOpenAutoFocus={(e) => {
            // Experiment 1: prevent Radix from auto-focusing the first tabbable
            // We rely on the step's own autoFocus (first input) to take initial focus.
            e.preventDefault();
          }}
          onKeyDownCapture={(e) => {
            if (e.key !== 'Tab') return;
            const container = e.currentTarget;
            try {
              const selector =
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
              const tabbables = Array.from(
                container.querySelectorAll(selector),
              );
              const active = document.activeElement;
              const idx = tabbables.indexOf(active);
              const step = e.shiftKey ? -1 : 1;
              const nextEl = tabbables[idx + step];
              if (nextEl && container.contains(nextEl)) {
                e.preventDefault();
                e.stopPropagation();
                requestAnimationFrame(() => {
                  try {
                    nextEl.focus();
                  } catch {}
                });
              }
            } catch {}
          }}
          ref={(el) => {
            if (!el) return;
            const header = el.querySelector('.HeaderModal');
            const setVar = (h) =>
              el.style.setProperty(
                '--dialog-header-height',
                `${Math.max(0, Math.round(h))}px`,
              );
            if (header && 'ResizeObserver' in window) {
              const ro = new ResizeObserver((entries) => {
                const ent = entries[0];
                const h = ent?.contentRect?.height ?? header.offsetHeight ?? 0;
                setVar(h);
              });
              ro.observe(header);
            } else {
              setVar(header?.offsetHeight ?? 0);
            }
          }}
        >
          {/* Hidden accessible title/description for a11y without moving focus */}
          <Dialog.Title asChild>
            <h2
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)',
                whiteSpace: 'nowrap',
                border: 0,
              }}
            >
              {title}
            </h2>
          </Dialog.Title>
          <Dialog.Description asChild>
            <p
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)',
                whiteSpace: 'nowrap',
                border: 0,
              }}
            >
              Completa los datos del formulario para continuar.
            </p>
          </Dialog.Description>
          <div className="DialogViewport">{children}</div>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
