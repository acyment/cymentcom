import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { AccordionHeader } from '@radix-ui/react-accordion';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';

const Intervenciones = () => {
  return (
    <Accordion.Item
      value="Intervencion"
      className="IntervencionesAccordion"
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
              padding={[70, 25]}
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
              padding={[70, 25]}
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
              padding={[70, 25]}
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
      <Accordion.Content className="AccordionContent HeroContent">
        <p>Casos</p>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default Intervenciones;
