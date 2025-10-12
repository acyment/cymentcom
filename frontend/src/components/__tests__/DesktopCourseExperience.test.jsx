import React, { useEffect } from 'react';
import { vi } from 'vitest';

import { render, screen } from '@/tests/utils';
import DesktopCourseExperience from '@/components/DesktopCourseExperience';

describe('DesktopCourseExperience deep link behaviour', () => {
  it('scrolls the course detail panel but not the hero when initialized with a slug', async () => {
    const scrollCalls = [];
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (options) {
      scrollCalls.push({ target: this, options });
    };

    const fakeSections = vi.fn(
      ({ initialSlug, renderOutlet, onCourseDetailReady }) => {
        useEffect(() => {
          const el = document.getElementById('detalle-curso');
          onCourseDetailReady?.(el);
        }, [onCourseDetailReady]);

        return (
          <div data-testid="sections-root">
            <div className="HeroHeroHero" />
            <div id="detalle-curso" />
            <span data-testid="initial-slug">{initialSlug}</span>
            <span data-testid="render-outlet">
              {renderOutlet ? 'yes' : 'no'}
            </span>
          </div>
        );
      },
    );

    try {
      render(
        <DesktopCourseExperience
          slug="CLB"
          SectionsComponent={fakeSections}
          scrollCourseDetail={(el) =>
            el?.scrollIntoView({ behavior: 'smooth' })
          }
        />,
      );

      expect(await screen.findByTestId('initial-slug')).toHaveTextContent(
        'CLB',
      );
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }

    const detailScrolls = scrollCalls.filter(
      ({ target }) => target?.id === 'detalle-curso',
    );
    const heroScrolls = scrollCalls.filter(({ target }) =>
      target?.classList?.contains('HeroHeroHero'),
    );

    expect(detailScrolls.length).toBeGreaterThan(0);
    expect(heroScrolls).toHaveLength(0);
  });
});
