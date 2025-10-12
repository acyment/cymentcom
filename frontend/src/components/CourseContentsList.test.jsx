import React from 'react';
import { render, screen, within } from '@/tests/utils';
import CourseContentsList from './CourseContentsList.jsx';

describe('CourseContentsList', () => {
  it('renders modules, topics and lessons from JSON contenido', () => {
    const modules = [
      {
        module_title: 'Módulo 1',
        summary: 'Resumen del módulo 1',
        topics: [
          {
            topic_title: 'Tema A',
            lessons: [
              { title: 'Lección 1', description: '' },
              {
                title: 'Lección 2',
                description: 'Descripción extendida',
              },
            ],
          },
        ],
      },
      {
        module_title: 'Módulo 2',
        summary: '',
        topics: [
          {
            topic_title: 'Tema B',
            lessons: [{ title: 'Lección 3', description: '' }],
          },
        ],
      },
    ];

    render(<CourseContentsList modules={modules} />);

    expect(
      screen.getByRole('heading', { name: /módulo 1/i, level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/resumen del módulo 1/i)).toBeInTheDocument();

    const firstTopic = screen.getByRole('heading', { name: /tema a/i });
    expect(firstTopic).toBeInTheDocument();

    const lessonList = within(firstTopic.closest('section')).getByRole('list');
    expect(lessonList).toBeInTheDocument();
    expect(within(lessonList).getByText(/lección 1/i)).toBeInTheDocument();
    expect(within(lessonList).getByText(/lección 2/i)).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /módulo 2/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/resumen del módulo 2/i)).not.toBeInTheDocument();
    expect(screen.getByText(/lección 3/i)).toBeInTheDocument();

    const moduleArticles = screen.getAllByRole('article');
    expect(moduleArticles.length).toBe(2);

    const topicSections = document.querySelectorAll('.CourseContentsTopic');
    expect(topicSections.length).toBeGreaterThan(0);
    topicSections.forEach((topic) => {
      const heading = within(topic).getByRole('heading', { level: 3 });
      expect(heading.classList.contains('CourseContentsTopicTitle')).toBe(true);
    });

    const lessons = screen.getAllByRole('listitem');
    lessons.forEach((lesson) => {
      expect(lesson.classList.contains('CourseContentsLesson')).toBe(true);
    });
  });

  it('permite ocultar los encabezados de módulo cuando se solicita', () => {
    const modules = [
      {
        module_title: 'Módulo 1',
        summary: '',
        topics: [
          {
            topic_title: 'Tema A',
            lessons: [{ title: 'Lección 1', description: '' }],
          },
        ],
      },
    ];

    render(<CourseContentsList modules={modules} showModuleHeadings={false} />);

    expect(screen.queryByText(/módulo 1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/tema a/i)).toBeInTheDocument();
  });
});
