import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import Cursos from './Cursos';

const Sections = () => {
  return (
    <Accordion.Root type="multiple">
      <Accordion.Item value="Alan">
        <Accordion.Trigger>Alan</Accordion.Trigger>
        <Accordion.Content>
          <p>Alan es un gran programador!</p>
        </Accordion.Content>
      </Accordion.Item>
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
