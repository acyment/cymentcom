import { useEffect, useState } from 'react';

// Capability-based device detection (more robust than width-only)
// - Primary signal: CSS media query '(hover: none) and (pointer: coarse)'
// - Fallback: navigator.maxTouchPoints > 0
// Usage: const isHandheld = useIsHandheld();
export function useIsHandheld() {
  const mq = '(hover: none) and (pointer: coarse)';

  const getValue = () => {
    if (typeof window === 'undefined') return false;
    const mql = window.matchMedia ? window.matchMedia(mq) : { matches: false };
    const touch =
      typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
    return Boolean(mql.matches || touch);
  };

  const [isHandheld, setIsHandheld] = useState(getValue);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(mq);
    const onChange = () => setIsHandheld(getValue());
    // Initialize on mount in case environment changed
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  return isHandheld;
}
