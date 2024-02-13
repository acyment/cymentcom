import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import Cursos from './Cursos';
import Hero from './Hero';

const Sections = () => {
  return (
    <Accordion.Root type="multiple">
      <Hero />
      <Cursos />
      <Accordion.Item value="Intervenciones">
        <Accordion.Trigger>Intervenciones</Accordion.Trigger>
        <Accordion.Content>
          <p>Intervention!</p>
        </Accordion.Content>
      </Accordion.Item>
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
