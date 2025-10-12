import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import ChevronDownIcon from 'lucide-react/dist/esm/icons/chevron-down.js';
import CourseContentsList, { normalizeModules } from './CourseContentsList.jsx';

const CourseContentsAccordion = ({ modules }) => {
  const items = normalizeModules(modules);

  if (!items.length) {
    return null;
  }

  return (
    <Accordion.Root
      type="multiple"
      className="CourseContentsAccordion"
      data-testid="CourseContentsAccordion"
    >
      {items.map((module, index) => {
        const triggerId = `course-module-${index}`;
        return (
          <Accordion.Item
            key={triggerId}
            value={triggerId}
            className="CourseContentsAccordionItem"
          >
            <Accordion.Header className="CourseContentsAccordionHeader">
              <Accordion.Trigger className="CourseContentsAccordionTrigger">
                <span className="CourseContentsAccordionTitle">
                  {module?.module_title ?? `Módulo ${index + 1}`}
                </span>
                <ChevronDownIcon
                  aria-hidden="true"
                  className="CourseContentsAccordionChevron"
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content
              className="CourseContentsAccordionContent"
              data-testid={`CourseContentsModule-${index}`}
            >
              <CourseContentsList
                modules={[module]}
                showModuleHeadings={false}
              />
            </Accordion.Content>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
};

export default CourseContentsAccordion;
