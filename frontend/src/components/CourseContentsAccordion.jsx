import React, { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDownIcon, InfoIcon } from 'lucide-react';

const BULLET_SEPARATOR = '•';

const CourseContentsAccordion = ({ modules }) => {
  const items = Array.isArray(modules) ? modules : [];

  if (!items.length) {
    return null;
  }

  return (
    <Accordion.Root
      type="multiple"
      className="CourseContentsAccordion"
      data-testid="CourseContentsAccordion"
      style={{ alignSelf: 'flex-start' }}
    >
      {items.map((module, index) => {
        const triggerId = `course-module-${index}`;
        const topics = normaliseTopics(module, index);

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
              {module?.summary ? (
                <p className="CourseContentsSummary">{module.summary}</p>
              ) : null}
              {topics.map((topic, topicIndex) => {
                const lessons = topic.lessons;
                const topicTitle = topic.topic_title;

                return (
                  <section
                    key={`${triggerId}-topic-${topicIndex}`}
                    className="CourseContentsTopic"
                    style={{
                      marginTop: topicIndex === 0 ? undefined : '1.5rem',
                    }}
                  >
                    <h3
                      className="CourseContentsTopicTitle"
                      style={{
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 600,
                        fontSize: '0.9em',
                      }}
                    >
                      {topicTitle}
                    </h3>
                    {lessons.length ? (
                      <ul
                        className="CourseContentsLessons"
                        style={{ paddingLeft: '1.25rem' }}
                      >
                        {lessons.map((lesson, lessonIndex) => {
                          const lessonTitle = lesson.title;
                          const description = lesson.description;

                          return (
                            <li
                              key={`${triggerId}-topic-${topicIndex}-lesson-${lessonIndex}`}
                              className="CourseContentsLesson"
                            >
                              <span
                                className={`CourseContentsLessonTitle${lesson.isDuplicate ? ' CourseContentsLessonTitle--duplicate' : ''}`}
                                style={{ fontWeight: 600 }}
                              >
                                {lessonTitle}
                              </span>
                              {description ? (
                                <LessonInfo
                                  title={lessonTitle}
                                  description={description}
                                />
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </section>
                );
              })}
            </Accordion.Content>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
};

const LessonInfo = ({ title, description }) => {
  const [open, setOpen] = useState(false);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        type="button"
        className="CourseContentsLessonInfoTrigger"
        aria-label={`Ver descripción de ${title}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ marginLeft: '0.5rem', cursor: 'pointer' }}
      >
        <InfoIcon aria-hidden="true" className="CourseContentsLessonInfoIcon" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="CourseContentsLessonInfoContent"
          sideOffset={8}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <p>{description}</p>
          <Popover.Arrow className="CourseContentsLessonInfoArrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const normaliseTopics = (module, moduleIndex) => {
  const existingTopics = Array.isArray(module?.topics) ? module.topics : [];

  if (existingTopics.length) {
    return existingTopics.map((topic, topicIndex) => {
      const lessons = Array.isArray(topic?.lessons) ? topic.lessons : [];
      const topicTitle =
        topic?.topic_title && topic.topic_title.trim().length
          ? topic.topic_title.trim()
          : `Tema ${topicIndex + 1}`;

      return {
        topic_title: topicTitle,
        lessons: lessons.map((lesson, lessonIndex) => {
          const title =
            lesson?.title && lesson.title.trim().length
              ? lesson.title.trim()
              : `Lección ${lessonIndex + 1}`;
          const isDuplicate =
            lessonIndex === 0 &&
            topicTitle &&
            title.toLowerCase() === topicTitle.toLowerCase();

          return {
            title,
            description: lesson?.description ?? '',
            isDuplicate,
          };
        }),
      };
    });
  }

  const legacyLessons = Array.isArray(module?.lessons) ? module.lessons : [];
  if (!legacyLessons.length) {
    const fallbackTitle =
      module?.module_title && module.module_title.trim().length
        ? module.module_title.trim()
        : `Módulo ${moduleIndex + 1}`;
    return [
      {
        topic_title: fallbackTitle,
        lessons: [{ title: fallbackTitle, description: '' }],
      },
    ];
  }

  return legacyLessons.map((lesson, lessonIndex) => {
    const titles = splitTitle(lesson?.title);
    const effectiveTitles =
      titles.length > 0
        ? titles
        : [
            lesson?.title && lesson.title.trim().length
              ? lesson.title.trim()
              : `Lección ${lessonIndex + 1}`,
          ];

    const topicTitle = effectiveTitles[0];
    const lessonTitles =
      effectiveTitles.length > 1 ? effectiveTitles.slice(1) : [];

    const entries = lessonTitles.length ? lessonTitles : [topicTitle];

    return {
      topic_title: effectiveTitles[0],
      lessons: entries.map((title, idx) => ({
        title,
        description: '',
        isDuplicate:
          idx === 0 && title.toLowerCase() === topicTitle.toLowerCase(),
      })),
    };
  });
};

const splitTitle = (text) => {
  if (!text) {
    return [];
  }
  const segments = String(text)
    .split(BULLET_SEPARATOR)
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (segments.length) {
    return segments;
  }
  const trimmed = String(text).trim();
  return trimmed ? [trimmed] : [];
};

export default CourseContentsAccordion;
