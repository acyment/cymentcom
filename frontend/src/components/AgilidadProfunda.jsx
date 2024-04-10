import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { AccordionHeader } from '@radix-ui/react-accordion';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import MuxPlayer from '@mux/mux-player-react';

const AgilidadProfunda = () => {
  return (
    <Accordion.Item
      value="AgilidadProfunda"
      className="AgilidadProfundaAccordion"
      id="agilidadProfunda"
    >
      <AccordionHeader className="AccordionHeader">
        <p className="TituloSeccionAccordion">Agilidad profunda</p>
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
      <Accordion.Trigger className="CircleButton CircleButtonNegro"></Accordion.Trigger>
      <Accordion.Content className="AccordionContent AgilidadProfundaContent">
        <MuxPlayer
          className="VideoAgilidadProfunda"
          playbackId="UxJyrVzp289RvfPfMeVNgGNlm01Fh9MDilKVV00zq4dKc"
          streamType="on-demand"
          muted
        />
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default AgilidadProfunda;
