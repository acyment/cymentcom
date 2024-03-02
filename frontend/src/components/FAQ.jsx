import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';

const FAQ = () => {
  return (
    <Accordion.Root type="multiple" collapsible={true} className="FAQAccordion">
      <Accordion.Item value="PDUs" className="FAQItem">
        <Accordion.Trigger className="AccordionTrigger PreguntaFAQ">
          ¿Esta certificación otorga PDUs?
          <img
            src="static/images/noun-chevron-1703100.svg"
            className="AccordionChevron"
            aria-hidden
          />
        </Accordion.Trigger>

        <Accordion.Content className="AccordionContent RespuestaFAQ">
          Este curso brinda 15 PDUs a quien ya es PMP. Además acredita 15 de las
          21 horas de entrenamiento en Agile Project Management para la
          certificación PMI-ACP. Para obtenerlos es necesario cargar la
          capacitación como "dictada por proveedor no registrado"
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};

export default FAQ;
