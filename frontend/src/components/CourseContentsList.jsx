import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import InfoIcon from 'lucide-react/dist/esm/icons/info.js';

const BULLET_SEPARATOR = '•';

export const normalizeModules = (modules = []) => {
  if (!Array.isArray(modules)) {
    return [];
  }

  return modules.map((module, moduleIndex) => {
    const moduleTitle =
      module?.module_title && module.module_title.trim()
        ? module.module_title.trim()
        : `Módulo ${moduleIndex + 1}`;
    const topics = normalizeTopics(module, moduleIndex);

    return {
      module_title: moduleTitle,
      summary: module?.summary ?? '',
      topics,
    };
  });
};

const normalizeTopics = (module, moduleIndex) => {
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
      topic_title: topicTitle,
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

const CourseContentsList = ({ modules, showModuleHeadings = true }) => {
  const normalizedModules = normalizeModules(modules);

  if (!normalizedModules.length) {
    return null;
  }

  return (
    <div className="CourseContentsList">
      {normalizedModules.map((module, moduleIndex) => (
        <article key={`${module.module_title}-${moduleIndex}`}>
          {showModuleHeadings ? (
            <h3 className="CourseContentsAccordionTitle">
              {module.module_title}
            </h3>
          ) : null}

          {module.summary ? (
            <p className="CourseContentsSummary">{module.summary}</p>
          ) : null}

          {module.topics.map((topic, topicIndex) => (
            <section
              key={`${module.module_title}-${topic.topic_title}-${topicIndex}`}
              className="CourseContentsTopic"
            >
              <h3 className="CourseContentsTopicTitle">{topic.topic_title}</h3>
              {topic.lessons.length ? (
                <ul className="CourseContentsLessons">
                  {topic.lessons.map((lesson, lessonIndex) => (
                    <li
                      key={`${topic.topic_title}-${lesson.title}-${lessonIndex}`}
                      className="CourseContentsLesson"
                    >
                      <span
                        className={`CourseContentsLessonTitle${
                          lesson.isDuplicate
                            ? ' CourseContentsLessonTitle--duplicate'
                            : ''
                        }`}
                      >
                        {lesson.title}
                      </span>
                      {lesson.description ? (
                        <LessonInfo
                          title={lesson.title}
                          description={lesson.description}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      ))}
    </div>
  );
};

export default CourseContentsList;
