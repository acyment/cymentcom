import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { AccordionHeader } from '@radix-ui/react-accordion';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';

const AgilidadProfunda = () => {
  return (
    <Accordion.Item
      value="AgilidadProfunda"
      className="AgilidadProfundaAccordion"
    >
      <AccordionHeader className="AccordionHeader">
        <p className="TituloSeccionAccordion AgilidadProfundaTitulo">
          Agilidad profunda
        </p>
        <p className="ContenidoSeccionAgilidadProfunda">
          La definición de agilidad y de marcos de trabajo asociados como Scrum
          es increíblemente minimalista. Esto le da una potencia y flexibilidad
          incomparables, pero también tiene su talón de Aquiles. La mayoría de
          los practicantes no logra comprender a fondo el espíritu detrás de las
          reglas y vive una experiencia de agilidad limitada.
        </p>
        <img
          src="static/images/firulete-horizontal.svg"
          className="FiruleteHorizontal"
        />
      </AccordionHeader>
      <Accordion.Trigger className="CircleButton"></Accordion.Trigger>
      <Accordion.Content className="HeroContent">
        <p>Casos</p>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default AgilidadProfunda;
