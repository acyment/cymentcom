import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CourseContentsAccordion from './CourseContentsAccordion';

const renderAccordion = (modules) => {
  return render(<CourseContentsAccordion modules={modules} />);
};

const stylesSource = fs.readFileSync(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../public/css/styles.scss',
  ),
  'utf8',
);

const getCssRuleBody = (...selectors) => {
  const escapedSelectors = selectors.map((selector) =>
    selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );

  const buildPattern = (orderedSelectors) =>
    new RegExp(`${orderedSelectors.join('\\s*,\\s*')}\\s*{([\\s\\S]*?)}`, 'm');

  let match = null;
  let pattern = buildPattern(escapedSelectors);
  match = stylesSource.match(pattern);

  if (!match && escapedSelectors.length > 1) {
    pattern = buildPattern([...escapedSelectors].reverse());
    match = stylesSource.match(pattern);
  }

  if (!match) {
    throw new Error(`No CSS rule found for selectors: ${selectors.join(', ')}`);
  }

  return match[1];
};

const extractScssBlock = (source, marker) => {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Marker not found: ${marker}`);
  }

  const includeIndex = source.lastIndexOf('@include', markerIndex);
  if (includeIndex === -1) {
    throw new Error(`No @include statement found before marker: ${marker}`);
  }

  const braceIndex = source.indexOf('{', includeIndex);
  if (braceIndex === -1) {
    throw new Error(
      `No opening brace found for include before marker: ${marker}`,
    );
  }

  let depth = 0;
  for (let i = braceIndex; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) {
      return source.slice(includeIndex, i + 1);
    }
  }

  throw new Error(
    `Unbalanced braces for block starting at index ${braceIndex}`,
  );
};

const getLastCssRuleBody = (selector) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`${escapedSelector}\\s*{([\\s\\S]*?)}`, 'gm');
  const matches = [...stylesSource.matchAll(pattern)];

  if (!matches.length) {
    throw new Error(`No CSS rule found for selector: ${selector}`);
  }

  return matches.at(-1)[1];
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
    expect(accordion.getAttribute('style')).toBeNull();

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
    expect(firstLessonsList.classList.contains('CourseContentsLessons')).toBe(
      true,
    );

    const secondTopicHeading = within(topicSections[1]).getByText(
      /la propuesta de la agilidad/i,
    );
    expect(
      secondTopicHeading.classList.contains('CourseContentsTopicTitle'),
    ).toBe(true);

    const infoButton = within(topicSections[0]).getByRole('button', {
      name: /ver descripción de velocidad versus adaptabilidad/i,
    });
    expect(infoButton).toHaveStyle({ marginLeft: '0.5rem', cursor: 'pointer' });

    const firstLesson = within(firstLessonsList).getByText(
      /mapa de la complejidad/i,
    );
    expect(firstLesson.classList.contains('CourseContentsLessonTitle')).toBe(
      true,
    );
  });

  it('usa la misma piel visual que el FAQ: anchos y estilos base', async () => {
    const modules = [
      {
        module_title: 'Filosofía de la agilidad',
        summary: '',
        topics: [
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

    const accordion = await screen.findByTestId('CourseContentsAccordion');
    expect(accordion.getAttribute('style')).toBeNull();

    const firstItem = accordion.querySelector('.CourseContentsAccordionItem');
    expect(firstItem?.getAttribute('style')).toBeNull();

    const moduleTrigger = within(firstItem).getByRole('button', {
      name: /filosofía de la agilidad/i,
    });
    expect(moduleTrigger.getAttribute('style')).toBeNull();

    const accordionRule = getCssRuleBody(
      '.FAQAccordion',
      '.CourseContentsAccordion',
    );
    expect(accordionRule).toMatch(/align-self:\s*flex-start/);
    expect(accordionRule).toMatch(/width:\s*100%/);

    const itemRule = getCssRuleBody('.FAQItem', '.CourseContentsAccordionItem');
    expect(itemRule).toMatch(/font-size:\s*1\.6vw/);
    expect(itemRule).toMatch(/margin-bottom:\s*2vw/);

    const triggerRule = getCssRuleBody(
      '.PreguntaFAQ',
      '.CourseContentsAccordionTrigger',
    );
    expect(triggerRule).toMatch(/background-color:\s*transparent/);
    expect(triggerRule).toMatch(/border-top:\s*2px\s+solid\s+black/);
    expect(triggerRule).toMatch(/justify-content:\s*space-between/);

    const hoverRule = getCssRuleBody(
      '.PreguntaFAQ:hover',
      '.CourseContentsAccordionTrigger:hover',
    );
    expect(hoverRule).toMatch(
      /text-shadow:\s*0\s+0\s+0\.3rem\s+rgba\(120,\s*84,\s*250,\s*0\.18\)/,
    );
    expect(hoverRule).not.toMatch(/box-shadow/);

    const topicTitleRule = getCssRuleBody('.CourseContentsTopicTitle');
    expect(topicTitleRule).toMatch(/text-transform:\s*uppercase/);
    expect(topicTitleRule).toMatch(/letter-spacing:\s*0\.05em/);
    expect(topicTitleRule).toMatch(/font-weight:\s*500/);

    const lessonRule = getCssRuleBody('.CourseContentsLesson');
    expect(lessonRule).toMatch(/padding-left:\s*1\.5rem/);

    const lessonListRule = getCssRuleBody('.CourseContentsLessons');
    expect(lessonListRule).toMatch(/padding-left:\s*0/);
  });

  it('mantiene triggers con fondo transparente y borde superior grueso', () => {
    const finalTriggerRule = getLastCssRuleBody(
      '.CourseContentsAccordionTrigger',
    );

    expect(finalTriggerRule).toMatch(/background-color:\s*transparent/);
    expect(finalTriggerRule).toMatch(/border-top:\s*2px\s+solid\s+black/);
    expect(finalTriggerRule).toMatch(/padding:\s*0(?:\s+0)?;/);
    expect(finalTriggerRule).toMatch(/gap:\s*0/);
  });

  it('define tipografías legibles en móviles para el acordeón de contenidos', () => {
    const block = extractScssBlock(
      stylesSource,
      '/* Course contents mobile overrides */',
    );

    expect(block).toMatch(/@include down\(\$bp-md\)\s*{/);
    expect(block).toMatch(
      /\.CourseContentsAccordionItem\s*{[\s\S]*font-size:\s*clamp\(18px,\s*4\.6vw,\s*20px\);/m,
    );
    expect(block).toMatch(
      /\.CourseContentsAccordionTitle\s*{[\s\S]*font-size:\s*clamp\(20px,\s*5\.5vw,\s*24px\);/m,
    );
    expect(block).toMatch(
      /\.CourseContentsTopicTitle\s*{[\s\S]*font-size:\s*clamp\(16px,\s*4\.8vw,\s*18px\);/m,
    );
    expect(block).toMatch(
      /\.CourseContentsSummary\s*{[\s\S]*font-size:\s*clamp\(15px,\s*4\.6vw,\s*17px\);/m,
    );
    expect(block).toMatch(
      /\.CourseContentsLesson(?:,|\s)\s*\.CourseContentsLessonTitle(?:,|\s)\s*\.CourseContentsLessonInfoTrigger[\s\S]*font-size:\s*clamp\(15px,\s*4\.5vw,\s*17px\);/m,
    );
  });
});
