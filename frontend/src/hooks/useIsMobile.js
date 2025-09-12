import { useEffect, useState } from 'react';

export function useIsMobile(query = '(max-width: 767px)') {
  const [isMobile, setIsMobile] = useState(
    () =>
      !!(
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia(query).matches
      ),
  );
  useEffect(() => {
    const mql =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia(query)
        : { matches: false, addEventListener() {}, removeEventListener() {} };
    const onChange = () => setIsMobile(!!mql.matches);
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, [query]);
  return isMobile;
}
