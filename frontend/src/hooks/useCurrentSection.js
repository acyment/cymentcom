import { useEffect, useState } from 'react';

export function useCurrentSection(ids = []) {
  const [current, setCurrent] = useState(ids[0] || null);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) return;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { threshold: [0.5], rootMargin: '-20% 0px -30% 0px' },
    );
    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids.join(',')]);
  return current;
}
