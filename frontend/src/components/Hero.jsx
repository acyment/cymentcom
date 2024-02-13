import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { AccordionHeader } from '@radix-ui/react-accordion';

const Hero = () => {
  const handlePayClick = () => {};

  return (
    <Accordion.Item value="Hero" className="HeroAccordion">
      <AccordionHeader>
        <p className="HeroText">
          <b className="HeroTextBold">Alan</b> explica la agilidad como nadie.
          Transmite ideas complejas en poco tiempo de manera interactiva. Domina
          la oscilación entre lo filosófico y lo pragmático. Se adapta sin
          sobresaltos a cualquier tipo de público.
        </p>
        <img src="static/images/hero.jpg" className="HeroImage"></img>
      </AccordionHeader>
      <Accordion.Trigger className="CircleButton"></Accordion.Trigger>
      <Accordion.Content className="HeroContent">
        <h3 className="HeroContentTitle">¿Quién es Alan?</h3>
        <div className="HeroContentListContainer">
          <ul className="HeroContentList">
            <li>
              Primer Certified Scrum Trainer de Scrum Alliance de habla hispana
              a nivel mundial
            </li>
            <li>
              Dictó cursos en 20 países y 4 continentes a más de 6000 alumnos,
              tanto en inglés como español
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
              Acompañó procesos de cambio organizacional en empresas de los más
              diversos tamaños e industrias, trabajando con los distintos
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
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default Hero;
