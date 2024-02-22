import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import Cursos from './Cursos';
import Hero from './Hero';
import Intervenciones from './Intervenciones';

const Sections = () => {
  return (
    <Accordion.Root type="multiple">
      <Hero />
      <Cursos />
      <Intervenciones />
      <Accordion.Item value="AgilidadProfunda">
        <Accordion.Trigger>AgilidadProfunda</Accordion.Trigger>
        <Accordion.Content>
          <p>Cuánta profundidad</p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};

export default Sections;
