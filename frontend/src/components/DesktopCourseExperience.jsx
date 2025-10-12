import React, { useCallback } from 'react';

const defaultScroll = (element) => {
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function DesktopCourseExperience({
  slug,
  SectionsComponent,
  scrollCourseDetail = defaultScroll,
}) {
  const handleCourseDetailReady = useCallback(
    (element) => {
      if (element) {
        scrollCourseDetail(element);
      }
    },
    [scrollCourseDetail],
  );

  React.useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 40;

    const tryScroll = () => {
      if (cancelled) return;
      const detailEl = document?.getElementById('detalle-curso');
      if (detailEl) {
        scrollCourseDetail(detailEl);
        return;
      }
      if (attempts < maxAttempts) {
        attempts += 1;
        setTimeout(tryScroll, 50);
      }
    };

    tryScroll();

    return () => {
      cancelled = true;
    };
  }, [slug, scrollCourseDetail]);

  return (
    <SectionsComponent
      initialSlug={slug}
      renderOutlet={false}
      onCourseDetailReady={handleCourseDetailReady}
    />
  );
}
