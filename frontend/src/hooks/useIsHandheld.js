import { useEffect, useState } from 'react';

// Capability-based device detection (more robust than width-only)
// - Primary signal: CSS media query '(hover: none) and (pointer: coarse)'
// - Fallback: navigator.maxTouchPoints > 0
// Usage: const isHandheld = useIsHandheld();
const COARSE_MQ = '(hover: none) and (pointer: coarse)';

export function useIsCoarse() {
  const getValue = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia(COARSE_MQ).matches;

  const [isCoarse, set] = useState(getValue);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(COARSE_MQ);
    const onChange = () => set(getValue());
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  return isCoarse;
}

export function useIsHandheld() {
  const isCoarse = useIsCoarse();
  const hasTouch =
    typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
  // Broader signal for behavior decisions (e.g., avoid hover-dependent UX)
  return Boolean(isCoarse || hasTouch);
}
