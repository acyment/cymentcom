import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { AccordionHeader } from '@radix-ui/react-accordion';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import ResilientMuxPlayer from './ResilientMuxPlayer';
import { USE_INLINE_VIDEO } from '@/features/video/videoFlags';
import MuxMp4Video from '@/features/video/MuxMp4Video';
import { useAccordionScroll } from '../hooks/useAccordionScroll';

const AgilidadProfunda = () => {
  const { contentRef, headerRef } = useAccordionScroll();

  return (
    <Accordion.Item
      value="AgilidadProfunda"
      className="AgilidadProfundaAccordion NavigationBarScrollOffset"
      id="agilidadProfunda"
    >
      <AccordionHeader
        className="AccordionHeader NavigationBarScrollOffset"
        ref={headerRef}
      >
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
      <Accordion.Content
        ref={contentRef}
        className="AccordionContent AgilidadProfundaContent NavigationBarScrollOffset"
      >
        {USE_INLINE_VIDEO ? (
          <MuxMp4Video
            className="VideoAgilidadProfunda"
            playbackId="01jQAtccLD74At5jA5J02gU1cDkgacdF2v9jA400HeqxGI"
          />
        ) : (
          <ResilientMuxPlayer
            className="VideoAgilidadProfunda"
            playbackId="01jQAtccLD74At5jA5J02gU1cDkgacdF2v9jA400HeqxGI"
            streamType="on-demand"
            muted
          />
        )}
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default AgilidadProfunda;
