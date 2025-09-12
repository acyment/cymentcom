import React, { useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { RoughNotation } from 'react-rough-notation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { BP_MD } from '@/styles/breakpoints';

const NavMenu = () => {
  const posthog = usePostHog();
  const [activeItem, setActiveItem] = useState(null);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile(`(max-width: ${BP_MD}px)`);

  const menuItems = [
    { href: '#hero', text: 'Alan' },
    { href: '#cursos', text: 'Cursos' },
    { href: '#intervenciones', text: 'Intervenciones' },
    { href: '#agilidadProfunda', text: 'Agilidad profunda' },
    { href: '#contacto', text: 'Contacto' },
  ];

  const trackSectionView = (section) => {
    posthog?.capture('nav_click', { section });
  };

  if (isMobile) {
    return (
      <div className="NavigationMenuRoot">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button aria-label="Menu" className="NavigationMenuLink">
              Menu
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content className="DialogContent">
              <Dialog.Title className="visually-hidden">
                Navigation
              </Dialog.Title>
              <Dialog.Description className="visually-hidden">
                Navigation options
              </Dialog.Description>
              <nav>
                <ul className="NavigationMenuList">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <a
                        className="NavigationMenuLink"
                        href={item.href}
                        onClick={() => {
                          trackSectionView(item.text.toLowerCase());
                          setOpen(false);
                        }}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  }

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
              onClick={() => trackSectionView(item.text.toLowerCase())}
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
