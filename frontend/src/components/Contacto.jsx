import React, { useState } from 'react';
import { RoughNotation } from 'react-rough-notation';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

const Contacto = () => {
  const [activeItem, setActiveItem] = useState(null);

  const menuItems = [
    { href: 'mailto:alan@cyment.com', text: 'alan@cyment.com' },
    {
      href: 'https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=acyment',
      text: 'LinkedIn',
    },
    { href: 'https://www.youtube.com/@cyment-fluid-orgs', text: 'YouTube' },
  ];

  return (
    <div className="AreaContacto NavigationBarScrollOffset" id="contacto">
      <div className="ContactoLeftSection">
        <h3 className="TituloSeccionAccordion">Contacto</h3>
        <NavigationMenu.Root>
          <NavigationMenu.List className="LinksContacto">
            {menuItems.map((item, index) => (
              <NavigationMenu.Item key={index}>
                <RoughNotation
                  type="circle"
                  show={activeItem === index}
                  color="#7b68ee"
                  strokeWidth={1}
                  padding={8}
                  className="RoughNotation"
                >
                  {' '}
                  <NavigationMenu.Link
                    className="NavigationMenuLink"
                    href={item.href}
                    onMouseEnter={() => setActiveItem(index)}
                    onMouseLeave={() => setActiveItem(null)}
                  >
                    {item.text}
                  </NavigationMenu.Link>
                </RoughNotation>
              </NavigationMenu.Item>
            ))}
            <NavigationMenu.Indicator className="NavigationMenuIndicator" />
          </NavigationMenu.List>
          <NavigationMenu.Viewport />
        </NavigationMenu.Root>
      </div>
      <div className="Copyright">
        <img className="ImagenCopyright" src="static/images/isotipo.svg" />
        <span className="CopyrightText">© Cyment 2024</span>
      </div>
    </div>
  );
};

export default Contacto;
