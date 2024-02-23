import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { AccordionHeader } from '@radix-ui/react-accordion';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';

const Contacto = () => {
  return (
    <div className="AreaContacto">
      <h3 className="TituloSeccionAccordion">Contacto</h3>
      <ul className="LinksContacto">
        <li>alan@cyment.com</li>
        <li>LinkedIn</li>
        <li>YouTube</li>
      </ul>
      <img></img>
      <div className="Copyright">
        <img src="static/images/isotipo.svg" />
        <span className="CopyrightText">© Cyment 2024</span>
      </div>
    </div>
  );
};

export default Contacto;
