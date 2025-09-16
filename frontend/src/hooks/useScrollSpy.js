import { useEffect, useRef, useState } from 'react';

export function useScrollSpy(ids = [], options = {}) {
  const { offset = 80, holdMs = 350 } = options;
  const [activeId, _setActiveId] = useState(ids[0] || null);
  const holdActive = useRef(false);
  const releaseTimer = useRef(null);

  const setActiveId = (id, opts = {}) => {
    _setActiveId(id);
    if (opts.manual) {
      holdActive.current = true;
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
      releaseTimer.current = setTimeout(() => {
        holdActive.current = false;
        handler();
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
      const scrollPos = window.scrollY + offset;
      let current = ids[0] || null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const elTop = el.offsetTop;
        if (elTop <= scrollPos) {
          current = id;
        } else {
          break;
        }
      }
      // If at (or near) the bottom and the user actually scrolled, force last section
      const doc = document.documentElement;
      const atBottom =
        window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
      const scrolled = window.scrollY > 10;
      if (scrolled && atBottom && ids.length) current = ids[ids.length - 1];
      _setActiveId(current);
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
  }, [ids.join(','), offset]);

  return [activeId, setActiveId];
}
