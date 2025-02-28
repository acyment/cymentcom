import React, { useRef } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { AccordionHeader } from '@radix-ui/react-accordion';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import { usePostHog } from 'posthog-js/react';
import Clientes from './Clientes';
import { useAccordionScroll } from '../hooks/useAccordionScroll';

const Hero = () => {
  const posthog = usePostHog();
  const { contentRef, headerRef } = useAccordionScroll();

  return (
    <Accordion.Item
      value="Hero"
      className="HeroAccordion NavigationBarScrollOffset"
      id="hero"
      onValueChange={(open) => {
        if (open) {
          posthog?.capture('hero_expand');
        } else {
          posthog?.capture('hero_collapse');
        }
      }}
    >
      <AccordionHeader ref={headerRef} className="NavigationBarScrollOffset">
        <section>
          <p className="HeroText">
            <b className="HeroTextBold">Alan</b> explica la agilidad como nadie.
            Transmite ideas complejas en poco tiempo de{' '}
            <RoughNotation
              color="#7b68ee"
              type="underline"
              show="true"
              animate="true"
              iterations={8}
              padding={[0, 5]}
            >
              manera interactiva
            </RoughNotation>
            . Domina la oscilación entre lo filosófico y lo pragmático. Se
            adapta sin sobresaltos a{' '}
            <RoughNotation
              padding={[5, 17]}
              strokeWidth={2}
              color="#7b68ee"
              type="circle"
              show="true"
              animate="true"
            >
              cualquier tipo de público
            </RoughNotation>
            .
          </p>
          <img src="static/images/hero.jpg" className="HeroImage"></img>
        </section>
      </AccordionHeader>
      <Accordion.Trigger className="CircleButton"></Accordion.Trigger>
      <Accordion.Content
        className="AccordionContent HeroContent NavigationBarScrollOffset"
        ref={contentRef}
      >
        <section>
          <RoughNotation
            type="circle"
            color="#7b68ee"
            show="true"
            animate="true"
          >
            <h3 className="HeroContentTitle">¿Quién es Alan?</h3>
          </RoughNotation>
          <div className="HeroContentListContainer">
            <ul className="HeroContentList">
              <li>
                Primer Certified Scrum Trainer de Scrum Alliance de habla
                hispana a nivel mundial
              </li>
              <li>
                Reconocido expositor y facilitador de grandes conversaciones en
                conferencias en inglés y español desde 2008
              </li>
              <li>
                Dictó cursos en 20 países y 4 continentes a más de 6000 alumnos,
                tanto en inglés como español
              </li>
              <li>
                Acompañó procesos de cambio organizacional en empresas de los
                más diversos tamaños e industrias, trabajando con los distintos
                niveles jerárquicos
              </li>
              <li>
                Se especializó en la agilidad a nivel organizacional, incluyendo
                el conjunto de decisiones técnicas necesarias para hacerla
                realidad
              </li>
            </ul>
            <img src="static/images/firulete.svg" className="Firulete"></img>
          </div>
          <Clientes></Clientes>
        </section>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default Hero;
