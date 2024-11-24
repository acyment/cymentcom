import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { AccordionHeader } from '@radix-ui/react-accordion';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';

import MuxPlayer from '@mux/mux-player-react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import useViewportUnits from '../hooks/useViewportUnits';

const CustomRightArrow = ({ onClick, ...rest }) => {
  const {
    onMove,
    carouselState: { currentSlide, deviceType },
  } = rest;
  // onMove means if dragging or swiping in progress.
  return (
    <button
      type="button"
      onClick={() => onClick()}
      className="CarouselCasosFlechaDespues"
    >
      <img src="static/images/flecha-carrusel-der.svg" />
    </button>
  );
};
const CustomLeftArrow = ({ onClick, ...rest }) => {
  const {
    onMove,
    carouselState: { currentSlide, deviceType },
  } = rest;
  // onMove means if dragging or swiping in progress.
  return (
    <button
      type="button"
      onClick={() => onClick()}
      className="CarouselCasosFlechaAntes"
    >
      <img src="static/images/flecha-carrusel-izq.svg" />
    </button>
  );
};

const Intervenciones = () => {
  const viewport = useViewportUnits();
  const videos = [
    {
      videoURL: 'iH01rVinOT5iOINLo026IY00KoOU00MEFHlHXBfK0100c21vg',
      titulo: 'Caso 1',
      descripcion:
        'Charla breve introductoria a la filosofía de la agilidad para todos los líderes de banco líder de Argentina',
    },
    {
      videoURL: 'Uwv6f00UdVR8s6HFeVP4RQFIl2BEY3QgzmcovYvG1Q004',
      titulo: 'Caso 2',
      descripcion:
        'Consultoría intensiva durante 2 meses para profundizar la transformación en área independiente dentro de multinacional', // Replace 'Description 2' with the actual description for the second video
    },
    {
      videoURL: '5JEBYRXpkpKbHv9AGIX84zh8LLUPDZjIxhwWjouTzok',
      titulo: 'Caso 3',
      descripcion:
        'Taller intensivo para profundizar transformación hacia la agilidad en el departamento de tecnología de universidad de renombre internacional', // Replace 'Description 3' with the actual description for the third video
    },
  ];
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };
  return (
    <Accordion.Item
      value="Intervencion"
      className="IntervencionesAccordion NavigationBarScrollOffset"
      id="intervenciones"
    >
      <AccordionHeader>
        <p className="IntervencionesTitulo">Intervenciones</p>
        <div className="IntervencionesAreaPreguntas">
          <div className="IntervencionesSeccionPregunta">
            <RoughNotation
              type="circle"
              color="#7b68ee"
              animate={true}
              show={true}
              padding={[viewport.vw(7), viewport.vw(3)]}
              strokeWidth={1}
              iterations={5}
            >
              <RoughNotation
                type="underline"
                color="#FFFFFF"
                show={true}
                animate={true}
                iterations={5}
              >
                <h3 className="IntervencionesTituloPregunta">Qué</h3>
              </RoughNotation>
            </RoughNotation>
            <p className="IntervencionesContenidoPregunta">
              Intervenciones puntuales para profundizar la agilidad de tu
              organización digital
            </p>
          </div>
          <div className="IntervencionesSeccionPregunta">
            <RoughNotation
              type="circle"
              color="#7b68ee"
              animate={true}
              show={true}
              padding={[viewport.vw(7), viewport.vw(3)]}
              strokeWidth={1}
              iterations={5}
            >
              <RoughNotation
                type="underline"
                color="#FFFFFF"
                show={true}
                animate={true}
                iterations={5}
              >
                <h3 className="IntervencionesTituloPregunta">Quién</h3>
              </RoughNotation>
            </RoughNotation>
            <p className="IntervencionesContenidoPregunta">
              Trabajo codo a codo con directivos y equipos de cambio e
              intervenciones masivas en departamentos completos
            </p>
          </div>
          <div className="IntervencionesSeccionPregunta">
            <RoughNotation
              type="circle"
              color="#7b68ee"
              animate={true}
              show={true}
              padding={[viewport.vw(7), viewport.vw(3)]}
              strokeWidth={1}
              iterations={5}
            >
              <RoughNotation
                type="underline"
                color="#FFFFFF"
                show={true}
                animate={true}
                iterations={5}
              >
                <h3 className="IntervencionesTituloPregunta">Cómo</h3>
              </RoughNotation>
            </RoughNotation>
            <p className="IntervencionesContenidoPregunta">
              Charlas de concientización, talleres masivos para impulsar el
              cambio y actividades con actores estratégicos
            </p>
          </div>
        </div>
      </AccordionHeader>
      <Accordion.Trigger className="CircleButton"></Accordion.Trigger>
      <Accordion.Content>
        <Carousel
          responsive={responsive}
          infinite={true}
          customRightArrow={<CustomRightArrow />}
          customLeftArrow={<CustomLeftArrow />}
          itemClass="ContenedorCarousel"
        >
          {videos.map((caso, index) => (
            <div className="CarouselCasosContenido">
              <div className="TextosCaso">
                <p className="TituloSeccionAccordion">{caso.titulo}</p>
                <p className="IntervencionesContenidoPregunta">
                  {caso.descripcion}
                </p>
                {/* TODO: Agregar link a PDF con caso detallado */}
              </div>
              <MuxPlayer
                className="VideoCaso"
                playbackId={caso.videoURL}
                streamType="on-demand"
                muted
              />
            </div>
          ))}
        </Carousel>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default Intervenciones;
