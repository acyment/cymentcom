import { useCallback, useEffect, useRef, useState } from 'react';

export function useScrollSpy(ids = [], options = {}) {
  const { offset = 80, holdMs = 350 } = options;
  const [activeId, _setActiveId] = useState(ids[0] || null);
  const holdActive = useRef(false);
  const releaseTimer = useRef(null);
  const idsKey = Array.isArray(ids) ? ids.join(',') : '';

  const evaluateActive = useCallback(() => {
    const idsArray = Array.isArray(ids) ? ids : [];
    if (!idsArray.length) {
      _setActiveId(null);
      return;
    }

    const scrollY = window.scrollY || 0;
    const scrollPos = scrollY + offset;
    let current = idsArray[0] || null;

    if (scrollY > 0) {
      for (const id of idsArray) {
        const el = document.getElementById(id);
        if (!el) continue;
        const elTop = el.offsetTop;
        if (elTop <= scrollPos) {
          current = id;
        } else {
          break;
        }
      }
    }

    const doc = document.documentElement;
    const atBottom =
      window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
    const scrolled = window.scrollY > 10;
    if (scrolled && atBottom && idsArray.length) {
      current = idsArray[idsArray.length - 1];
    }

    _setActiveId(current);
  }, [idsKey, offset]);

  const setActiveId = (id, opts = {}) => {
    _setActiveId(id);
    if (opts.manual) {
      holdActive.current = true;
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
      releaseTimer.current = setTimeout(() => {
        holdActive.current = false;
        evaluateActive();
      }, holdMs);
    }
  };

  useEffect(() => {
    const handler = () => {
      if (holdActive.current) {
        if (releaseTimer.current) clearTimeout(releaseTimer.current);
        releaseTimer.current = setTimeout(() => {
          holdActive.current = false;
          handler();
        }, holdMs);
        return;
      }
      evaluateActive();
    };

    handler();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    window.addEventListener('hashchange', handler);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
      window.removeEventListener('hashchange', handler);
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluateActive, holdMs]);

  return [activeId, setActiveId];
}
