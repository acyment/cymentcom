import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import { Link, useParams, useRouterState } from '@tanstack/react-router';
import * as Accordion from '@radix-ui/react-accordion';
import formatDate from 'intl-dateformat';
import CircleLoader from 'react-spinners/CircleLoader';
import ArrowLeftIcon from 'lucide-react/dist/esm/icons/arrow-left.js';

import { adjustTimeZone, calculateTimeDifference } from '@/utils/courseTime';
import { useOpenCheckout } from '@/features/checkout/useOpenCheckout';
import CourseContentsAccordion from './CourseContentsAccordion';

const courseDetailCache = new Map();

function seedDetailed(course, detailed = false) {
  if (!course) return null;
  if ('__detailed' in course) {
    return detailed ? { ...course, __detailed: true } : course;
  }
  return { ...course, __detailed: detailed };
}

function useCourseDetail(slug, initialCourse) {
  const seededInitial = useMemo(() => {
    if (!slug) return null;
    const cached = courseDetailCache.get(slug);
    if (cached) return cached;
    if (initialCourse) {
      const seeded = seedDetailed(
        initialCourse,
        Boolean(initialCourse.__detailed),
      );
      courseDetailCache.set(slug, seeded);
      return seeded;
    }
    return null;
  }, [slug, initialCourse]);

  const [status, setStatus] = useState(() => {
    if (!slug) return 'idle';
    if (seededInitial) return 'success';
    return 'loading';
  });
  const [course, setCourse] = useState(() => seededInitial);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!slug) return undefined;
    let isMounted = true;

    const cached = courseDetailCache.get(slug) || null;
    const baseline = cached || seededInitial;

    if (baseline && course !== baseline) {
      setCourse(baseline);
      setStatus('success');
      setError(null);
    }

    const needsDetailedFetch =
      reloadToken > 0 || !baseline || baseline.__detailed !== true;

    if (!needsDetailedFetch) {
      return () => {
        isMounted = false;
      };
    }

    if (!baseline) {
      setStatus('loading');
    } else if (reloadToken > 0) {
      setStatus('success');
    }
    setError(null);

    axios
      .get(`/api/tipos-de-curso/${slug}`)
      .then((res) => {
        if (!isMounted) return;
        const detailedCourse = seedDetailed(res.data, true);
        courseDetailCache.set(slug, detailedCourse);
        setCourse(detailedCourse);
        setStatus('success');
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err);
        if (!baseline) {
          setStatus('error');
        } else {
          setStatus('success');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, reloadToken, seededInitial, course]);

  return { status, course, error, refetch };
}

export default function CourseDetail() {
  const { slug } = useParams({ from: '/cursos/$slug' });
  const locationState = useRouterState({
    select: (state) => state.location.state,
  });
  const initialCourse = useMemo(() => {
    if (
      locationState &&
      typeof locationState === 'object' &&
      locationState !== null
    ) {
      return locationState.course ?? null;
    }
    return null;
  }, [locationState]);
  const { status, course, error, refetch } = useCourseDetail(
    slug,
    initialCourse,
  );
  const openCheckout = useOpenCheckout();
  const headerRef = useRef(null);
  const headerHeightRef = useRef(0);
  const headerOffsetRef = useRef(0);
  const navRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const didInitialScrollRef = useRef(false);

  const courseSections = useMemo(
    () => [
      { id: 'horarios', label: 'Horarios' },
      { id: 'estructura', label: 'Estructura' },
      { id: 'descripcion', label: 'Descripción' },
      { id: 'contenidos', label: 'Contenidos' },
      { id: 'faq', label: 'Preguntas frecuentes' },
    ],
    [],
  );

  useEffect(() => {
    // Prevent the browser from restoring a mid-page scroll when arriving from the catalog
    const prev =
      typeof window !== 'undefined' && window.history
        ? window.history.scrollRestoration
        : undefined;
    if (typeof window !== 'undefined' && window.history) {
      try {
        window.history.scrollRestoration = 'manual';
      } catch (e) {
        // ignore
      }
    }

    if (!headerRef.current) return undefined;

    const updatePadding = (height) => {
      const resolved = Number.isFinite(height) ? height : 0;
      const rounded = Math.max(Math.round(resolved), 0);
      const navHeight = navRef.current?.offsetHeight ?? 0;
      const offset = Math.max(rounded - Math.round(navHeight) - 20, 0);

      headerHeightRef.current = rounded;
      headerOffsetRef.current = offset;
      setHeaderHeight(rounded);

      const heightPx = `${rounded}px`;
      const offsetPx = `${offset}px`;

      document.documentElement.style.setProperty(
        '--course-detail-header-height',
        heightPx,
      );
      document.documentElement.style.setProperty(
        '--course-detail-header-offset',
        offsetPx,
      );
      document.documentElement.style.scrollPaddingTop = offsetPx;
    };

    if (typeof ResizeObserver === 'undefined') {
      updatePadding(headerRef.current.offsetHeight ?? 0);
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextHeight =
        entry.contentRect?.height ?? headerRef.current?.offsetHeight ?? 0;
      updatePadding(nextHeight);
    });

    observer.observe(headerRef.current);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(
        '--course-detail-header-height',
      );
      document.documentElement.style.removeProperty(
        '--course-detail-header-offset',
      );
      document.documentElement.style.scrollPaddingTop = '';
      if (typeof window !== 'undefined' && window.history && prev) {
        try {
          window.history.scrollRestoration = prev;
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // After header height is measured and offsets applied, ensure initial load starts at top
  useEffect(() => {
    if (didInitialScrollRef.current) return;
    if (typeof window === 'undefined') return;
    const hasHash = !!window.location.hash;
    if (!hasHash) {
      // Wait a frame so scroll-padding is effective, then scroll to top
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
    }
    didInitialScrollRef.current = true;
  }, [headerHeight]);

  const handleSectionNav = useCallback((event) => {
    if (typeof window === 'undefined') return;

    const href = event.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) {
      return;
    }

    const sectionId = href.slice(1);
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    event.preventDefault();
    const resolvedHeaderHeight =
      headerHeightRef.current ||
      headerRef.current?.offsetHeight ||
      headerHeight ||
      0;
    if (typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const rect = target.getBoundingClientRect();
      const offset = headerOffsetRef.current || resolvedHeaderHeight;
      window.scrollTo({
        top: window.pageYOffset + rect.top - offset,
        behavior: 'smooth',
      });
    }

    if (window.history?.replaceState) {
      window.history.replaceState(null, '', href);
    } else {
      window.location.hash = href;
    }
  }, []);

  const upcomingCourse = useMemo(
    () => course?.upcoming_courses?.[0] ?? null,
    [course?.upcoming_courses],
  );

  const scheduleRows = useMemo(() => {
    if (!upcomingCourse) return [];
    return [
      {
        label: 'MEX/CRI [GMT-6]',
        start: adjustTimeZone(upcomingCourse.hora_inicio, -3, -6),
        end: adjustTimeZone(upcomingCourse.hora_fin, -3, -6),
      },
      {
        label: 'ECU/PER [GMT-5]',
        start: adjustTimeZone(upcomingCourse.hora_inicio, -3, -5),
        end: adjustTimeZone(upcomingCourse.hora_fin, -3, -5),
      },
      {
        label: 'ARG/URU [GMT-3]',
        start: upcomingCourse.hora_inicio,
        end: upcomingCourse.hora_fin,
      },
    ];
  }, [upcomingCourse]);

  const structureLabel = useMemo(() => {
    if (!upcomingCourse) return null;
    const startDate = buildNeutralDate(upcomingCourse.fecha);
    const endDate = pushDays(
      startDate,
      (upcomingCourse.cantidad_dias ?? 1) - 1,
    );
    const startDay = capitalize(
      formatDate(startDate, 'dddd', { locale: 'es-AR' }),
    );
    const endDay = formatDate(endDate, 'dddd', { locale: 'es-AR' });
    const dailyHours = calculateTimeDifference(
      upcomingCourse.hora_inicio,
      upcomingCourse.hora_fin,
    );
    return `${startDay} a ${endDay} en ${
      upcomingCourse.cantidad_dias
    } sesiones diarias de ${formatHours(dailyHours)} hs cada una`;
  }, [upcomingCourse]);

  const courseModules = useMemo(
    () => (Array.isArray(course?.contenido) ? course.contenido : []),
    [course?.contenido],
  );

  if (status === 'loading') {
    return (
      <main className="CourseDetailPage">
        <div className="LoaderContainer">
          <CircleLoader color="#ffffff" size={60} />
          <p className="LoaderLegend" aria-live="polite">
            <span className="LoaderLegendAccessible">Cargando...</span>
            Cargando
            <span className="LoaderLegendDots" aria-hidden="true">
              <span className="LoaderLegendDot">.</span>
              <span className="LoaderLegendDot">.</span>
              <span className="LoaderLegendDot">.</span>
            </span>
          </p>
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="CourseDetailPage">
        <p>No pudimos cargar el curso.</p>
        <button type="button" className="CourseDetailRetry" onClick={refetch}>
          Reintentar
        </button>
      </main>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <main className="CourseDetailPage">
      <div
        className="CourseDetailHeader"
        data-testid="CourseDetailHeader"
        ref={headerRef}
        style={{ '--course-detail-header-height': `${headerHeight}px` }}
      >
        <div className="CourseDetailBackRow">
          <Link to="/" className="CourseDetailBackLink">
            <ArrowLeftIcon aria-hidden="true" />
            <span>Volver al catálogo</span>
          </Link>
        </div>
        <h1>{course.nombre_completo}</h1>
        <nav
          className="CourseDetailNav"
          aria-label="Detalles del curso"
          ref={navRef}
        >
          {courseSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={handleSectionNav}
            >
              {section.label}
            </a>
          ))}
        </nav>
      </div>
      <section className="CourseDetailSection" id="horarios">
        <h2>Próximos cursos</h2>
        {upcomingCourse ? (
          <ul className="CourseDetailSchedule">
            {scheduleRows.map((row) => (
              <li key={row.label}>
                {row.label} {row.start} a {row.end} hs.
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay próximas fechas disponibles.</p>
        )}
      </section>

      <section className="CourseDetailSection" id="estructura">
        <h2>Estructura</h2>
        <p>
          {structureLabel ??
            'Publicaremos la estructura cuando confirmemos fechas.'}
        </p>
      </section>

      <section className="CourseDetailSection" id="descripcion">
        <h2>Descripción</h2>
        <p>{course.resumen}</p>
      </section>

      <section className="CourseDetailSection" id="contenidos">
        <h2>¿Qué Vas a Dominar?</h2>
        {courseModules.length ? (
          <CourseContentsAccordion modules={courseModules} />
        ) : (
          <p>Pronto publicaremos el temario.</p>
        )}
      </section>

      <section className="CourseDetailSection" id="faq">
        <h2>Preguntas frecuentes</h2>
        {course.faq_entries?.length ? (
          <Accordion.Root
            type="single"
            collapsible
            className="CourseDetailFaq"
            data-testid="CourseDetailFaqAccordion"
          >
            {course.faq_entries.map((entry) => (
              <Accordion.Item
                key={entry.pregunta}
                value={entry.pregunta}
                className="CourseDetailFaqItem"
              >
                <Accordion.Trigger className="CourseDetailFaqTrigger">
                  {entry.pregunta}
                </Accordion.Trigger>
                <Accordion.Content className="CourseDetailFaqContent">
                  <p>{entry.respuesta}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        ) : (
          <p>No hay preguntas frecuentes disponibles.</p>
        )}
      </section>
      {upcomingCourse ? (
        <div className="CourseDetailStickyCta">
          <button
            type="button"
            className="CourseDetailStickyButton"
            onClick={() =>
              openCheckout({
                idCurso: upcomingCourse.id,
                nombreCorto: course.nombre_corto,
                costoUSD: course.costo_usd,
                costoARS: course.costo_ars,
              })
            }
          >
            Inscribirme
          </button>
        </div>
      ) : null}
    </main>
  );
}

export { useCourseDetail };

export function __clearCourseDetailCache() {
  courseDetailCache.clear();
}

function buildNeutralDate(isoDateString) {
  if (!isoDateString) return new Date();
  const date = new Date(isoDateString);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}

function pushDays(date, amount) {
  const clone = new Date(date.getTime());
  clone.setDate(clone.getDate() + amount);
  return clone;
}

function capitalize(value = '') {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatHours(value) {
  if (!Number.isFinite(value)) return `${value}`;
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : `${rounded.toFixed(1)}`;
}
