import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import Cursos from './Cursos';
import Hero from './Hero';
import Intervenciones from './Intervenciones';
import AgilidadProfunda from './AgilidadProfunda';

const Sections = () => {
  return (
    <Accordion.Root type="multiple">
      <Hero />
      <Cursos />
      <Intervenciones />
      <AgilidadProfunda />
    </Accordion.Root>
  );
};

export default Sections;
