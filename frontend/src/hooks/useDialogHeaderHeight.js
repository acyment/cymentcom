import { useEffect } from 'react';

/**
 * Observe a header element inside a dialog and write its height
 * to a CSS custom property on the dialog root element.
 *
 * @param {React.RefObject<HTMLElement>} rootRef - ref to the dialog content root
 * @param {string} headerSelector - selector to find the header element
 * @param {string} cssVarName - CSS variable name to write (defaults to --dialog-header-height)
 */
export function useDialogHeaderHeight(
  rootRef,
  headerSelector = '.HeaderModal',
  cssVarName = '--dialog-header-height',
) {
  useEffect(() => {
    const root = rootRef?.current;
    if (!root) return;

    let header = root.querySelector(headerSelector);
    let ro;
    let rafId;

    const setVar = (h) => {
      const val = `${Math.max(0, Math.round(h || 0))}px`;
      root.style.setProperty(cssVarName, val);
    };

    const startObserver = () => {
      if (!header) return;
      // Initial measure
      setVar(header.offsetHeight || 0);
      if ('ResizeObserver' in window) {
        ro = new ResizeObserver((entries) => {
          const ent = entries[0];
          const h = ent?.contentRect?.height ?? header.offsetHeight ?? 0;
          setVar(h);
        });
        ro.observe(header);
      }
    };

    if (!header) {
      // Try again on the next frame (children might render header after mount)
      rafId = requestAnimationFrame(() => {
        header = root.querySelector(headerSelector);
        startObserver();
      });
    } else {
      startObserver();
    }

    return () => {
      if (ro) ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [rootRef, headerSelector, cssVarName]);
}
