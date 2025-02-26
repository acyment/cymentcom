import React, { useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { RoughNotation } from 'react-rough-notation';

const NavMenu = () => {
  const [activeItem, setActiveItem] = useState(null);

  const menuItems = [
    { href: '#hero', text: 'Alan' },
    { href: '#cursos', text: 'Cursos' },
    { href: '#intervenciones', text: 'Intervenciones' },
    { href: '#agilidadProfunda', text: 'Agilidad profunda' },
    { href: '#contacto', text: 'Contacto' },
  ];

  const trackSectionView = (section) => {
    if (window.posthog) {
      window.posthog.capture('nav_click', { section });
    }
  };

  return (
    <NavigationMenu.Root className="NavigationMenuRoot">
      <NavigationMenu.List className="NavigationMenuList">
        {menuItems.map((item, index) => (
          <NavigationMenu.Item key={index}>
            <NavigationMenu.Link
              className="NavigationMenuLink"
              href={item.href}
              onMouseEnter={() => setActiveItem(index)}
              onMouseLeave={() => setActiveItem(null)}
              data-umami-event={`nav-${item.text.toLowerCase().replace(' ', '-')}`}
            >
              <RoughNotation
                type="circle"
                show={activeItem === index}
                color="#7b68ee"
                strokeWidth={1}
                padding={8}
              >
                {item.text}
              </RoughNotation>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        ))}
        <NavigationMenu.Indicator className="NavigationMenuIndicator" />
      </NavigationMenu.List>
      <NavigationMenu.Viewport />
    </NavigationMenu.Root>
  );
};

export default NavMenu;
