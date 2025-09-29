import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';

const FAQ = ({ faqEntries }) => {
  return (
    <Accordion.Root type="multiple" className="FAQAccordion">
      {faqEntries &&
        faqEntries.map((faqEntry) => (
          <Accordion.Item
            key={faqEntry.pregunta || faqEntry.id}
            value={faqEntry.pregunta}
            className="FAQItem"
          >
            <Accordion.Trigger className="AccordionTrigger PreguntaFAQ">
              {faqEntry.pregunta}
              <img
                src="static/images/noun-chevron-1703100.svg"
                className="AccordionChevron"
                aria-hidden
              />
            </Accordion.Trigger>

            <Accordion.Content className="AccordionContent RespuestaFAQ">
              {faqEntry.respuesta}
            </Accordion.Content>
          </Accordion.Item>
        ))}
    </Accordion.Root>
  );
};

export default FAQ;
