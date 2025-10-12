import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import ChevronDownIcon from 'lucide-react/dist/esm/icons/chevron-down.js';

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
              <ChevronDownIcon
                className="CourseContentsAccordionChevron"
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
