// hooks/useAccordionScroll.js
import { useRef, useLayoutEffect } from 'react';

export const useAccordionScroll = () => {
  const contentRef = useRef(null);
  const headerRef = useRef(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-state'
        ) {
          const newState = content.getAttribute('data-state');
          if (newState === 'open') {
            contentRef.current?.scrollIntoView({ behavior: 'smooth' });
          } else if (newState === 'closed') {
            headerRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    observer.observe(content, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return {
    contentRef,
    headerRef,
  };
};
