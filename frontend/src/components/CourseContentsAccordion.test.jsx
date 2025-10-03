import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CourseContentsAccordion from './CourseContentsAccordion';

const renderAccordion = (modules) => {
  return render(<CourseContentsAccordion modules={modules} />);
};

describe('CourseContentsAccordion', () => {
  it('renders every lesson within a topic and shows popover icons when a description is present', async () => {
    const modules = [
      {
        module_title: 'Filosofía de la agilidad',
        summary: '',
        topics: [
          {
            topic_title: 'La propuesta de la agilidad',
            lessons: [
              { title: 'Desarrollo orgánico versus mecánico', description: '' },
              { title: 'Velocidad de aprendizaje', description: '' },
              { title: 'Foco y flujo', description: '' },
              {
                title: 'Dolores y causas del multitasking',
                description: 'Discusión guiada de 15 minutos',
              },
            ],
          },
        ],
      },
    ];

    renderAccordion(modules);

    const trigger = screen.getByRole('button', {
      name: /filosofía de la agilidad/i,
    });
    await userEvent.click(trigger);

    const accordion = await screen.findByTestId('CourseContentsAccordion');
    expect(accordion).toHaveStyle({ alignSelf: 'flex-start' });

    const panel = await screen.findByTestId('CourseContentsModule-0');
    expect(
      within(panel).getByText(/desarrollo orgánico versus mecánico/i),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText(/velocidad de aprendizaje/i),
    ).toBeInTheDocument();
    expect(within(panel).getByText(/foco y flujo/i)).toBeInTheDocument();
    expect(
      within(panel).getByText(/dolores y causas del multitasking/i),
    ).toBeInTheDocument();

    const infoTrigger = within(panel).getByRole('button', {
      name: /ver descripción de dolores y causas del multitasking/i,
    });
    await userEvent.hover(infoTrigger);

    expect(
      await screen.findByText(/discusión guiada de 15 minutos/i),
    ).toBeInTheDocument();

    expect(
      within(panel).queryByRole('button', {
        name: /ver descripción de desarrollo orgánico versus mecánico/i,
      }),
    ).toBeNull();
  });

  it('aplica jerarquía visual: sangría, espaciado y estilos de títulos', async () => {
    const modules = [
      {
        module_title: 'Filosofía de la agilidad',
        summary: '',
        topics: [
          {
            topic_title: 'Complejidad, el por qué de la agilidad',
            lessons: [
              { title: 'Mapa de la complejidad', description: '' },
              {
                title: 'Velocidad versus adaptabilidad',
                description: 'Comparativa práctica',
              },
            ],
          },
          {
            topic_title: 'La propuesta de la agilidad',
            lessons: [
              { title: 'Desarrollo orgánico versus mecánico', description: '' },
            ],
          },
        ],
      },
    ];

    renderAccordion(modules);

    const trigger = screen.getByRole('button', {
      name: /filosofía de la agilidad/i,
    });
    await userEvent.click(trigger);

    const panel = await screen.findByTestId('CourseContentsModule-0');
    const topicSections = panel.querySelectorAll('.CourseContentsTopic');
    expect(topicSections).toHaveLength(2);

    const firstLessonsList = within(topicSections[0]).getByRole('list');
    expect(firstLessonsList).toHaveStyle({ paddingLeft: '1.25rem' });

    expect(topicSections[1]).toHaveStyle({ marginTop: '1.5rem' });

    const secondTopicHeading = within(topicSections[1]).getByText(
      /la propuesta de la agilidad/i,
    );
    expect(secondTopicHeading).toHaveStyle({
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontWeight: '600',
    });

    const infoButton = within(topicSections[0]).getByRole('button', {
      name: /ver descripción de velocidad versus adaptabilidad/i,
    });
    expect(infoButton).toHaveStyle({ marginLeft: '0.5rem', cursor: 'pointer' });

    const firstLesson = within(firstLessonsList).getByText(
      /mapa de la complejidad/i,
    );
    expect(firstLesson).toHaveStyle({ fontWeight: '600' });
  });
});
