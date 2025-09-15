import React, { useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { RoughNotation } from 'react-rough-notation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { BP_MD } from '@/styles/breakpoints';
import { NAV_ITEMS } from './navItems';

const NavMenu = () => {
  const posthog = usePostHog();
  const [activeItem, setActiveItem] = useState(null);
  const isMobile = useIsMobile(`(max-width: ${BP_MD}px)`);
  const mode = isMobile ? 'mobile' : 'desktop';
  const items = NAV_ITEMS.filter((i) => i.visibleOn.includes(mode));
  const sectionIds = Array.from(
    new Set(
      NAV_ITEMS.map((i) =>
        i.href.startsWith('#') ? i.href.slice(1) : null,
      ).filter(Boolean),
    ),
  );
  const [currentId, setCurrentId] = useScrollSpy(sectionIds, { offset: 90 });

  const trackSectionView = (section) => {
    posthog?.capture('nav_click', { section });
  };

  const LinkContent = ({ text, index, isCurrent }) => {
    // Underline current section on all viewports; otherwise show hover circle on desktop
    if (isCurrent) {
      return (
        <RoughNotation
          className="NavNotation NavNotation--current"
          type="underline"
          show
          color="#7b68ee"
          strokeWidth={2}
          padding={2}
        >
          {text}
        </RoughNotation>
      );
    }
    if (!isMobile) {
      return (
        <RoughNotation
          className="NavNotation"
          type="circle"
          show={activeItem === index}
          color="#7b68ee"
          strokeWidth={1}
          padding={8}
        >
          {text}
        </RoughNotation>
      );
    }
    return text;
  };

  return (
    <NavigationMenu.Root
      className={`NavigationMenuRoot ${isMobile ? 'NavigationMenuRoot--mobile' : ''}`}
    >
      <NavigationMenu.List className="NavigationMenuList">
        {items.map((item, index) => {
          const id = item.href.startsWith('#') ? item.href.slice(1) : null;
          const isCurrent = !!id && id === currentId;
          return (
            <NavigationMenu.Item key={`${item.href}-${index}`}>
              <NavigationMenu.Link
                className="NavigationMenuLink"
                href={item.href}
                onMouseEnter={
                  !isMobile ? () => setActiveItem(index) : undefined
                }
                onMouseLeave={!isMobile ? () => setActiveItem(null) : undefined}
                onClick={() => {
                  trackSectionView(item.text.toLowerCase());
                  if (id) setCurrentId(id, { manual: true });
                }}
                aria-current={isCurrent ? 'true' : undefined}
              >
                <LinkContent
                  text={item.text}
                  index={index}
                  isCurrent={isCurrent}
                />
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          );
        })}
        {!isMobile && (
          <NavigationMenu.Indicator className="NavigationMenuIndicator" />
        )}
      </NavigationMenu.List>
      <NavigationMenu.Viewport />
    </NavigationMenu.Root>
  );
};

export default NavMenu;
