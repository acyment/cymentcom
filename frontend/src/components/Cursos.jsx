import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { usePostHog } from 'posthog-js/react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useNavigate } from '@tanstack/react-router';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import axios from 'axios';
import { formatCourseDateRange as fmtCourseRange } from '@/utils/courseDates';
import CircleLoader from 'react-spinners/CircleLoader';
import { useOpenCheckout } from '@/features/checkout/useOpenCheckout';
import { useIsMobile } from '@/hooks/useIsMobile';
import CourseContentsList from './CourseContentsList.jsx';
import { loadCourseDetailPanel } from './loadCourseDetailPanel';

const LazyCourseDetailPanel = lazy(() => loadCourseDetailPanel());

let cachedTiposCurso = null;

const Cursos = ({
  initialSlug = null,
  onCourseDetailReady = () => {},
} = {}) => {
  const [tiposCurso, setTiposCurso] = useState([]);

  const refCourseDetailPanel = useRef(null);
  const refListaCursos = useRef(null);
  const [selectedCourse, setSelectedCourse] = useState(initialSlug ?? null);
  const [triggerScroll, setTriggerScroll] = useState(false);
  const posthog = usePostHog();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      slideChanged() {},
      slides: {
        perView: 3,
      },
    },
    [
      // add plugins here
    ],
  );
  useEffect(() => {
    let isMounted = true;

    if (cachedTiposCurso) {
      setTiposCurso(cachedTiposCurso);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/tipos-de-curso');
        const dictTiposCurso = response.data.reduce((acc, obj) => {
          acc[obj.nombre_corto] = obj;
          return acc;
        }, {});
        if (!isMounted) return;
        cachedTiposCurso = dictTiposCurso;
        setTiposCurso(dictTiposCurso);
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching data: ', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSelectedItem = (value) => {
    // Track expansion only when changing from null or different course
    if (value && value !== selectedCourse) {
      const courseName = tiposCurso[value]?.nombre_corto || '';
      posthog.capture('More info on training ' + courseName);
    }

    setSelectedCourse(value); // Update selected item
    setTriggerScroll(true); // Set trigger to true to initiate scroll in useEffect
  };

  useEffect(() => {
    if (!initialSlug) return;
    setSelectedCourse((prev) => (prev === initialSlug ? prev : initialSlug));
    setTriggerScroll(true);
  }, [initialSlug]);

  useEffect(() => {
    if (!triggerScroll) return;
    let canceled = false;
    const doScroll = async () => {
      const smooth = { behavior: 'smooth' };
      if (selectedCourse === '') {
        refListaCursos.current?.scrollIntoView(smooth);
      } else {
        // CourseDetailPanel is lazy-loaded; wait briefly for it to mount
        let tries = 0;
        while (!canceled && !refCourseDetailPanel.current && tries < 20) {
          await new Promise((r) => setTimeout(r, 50));
          tries += 1;
        }
        // Fallback: query by class if ref hasn't attached yet
        const el =
          refCourseDetailPanel.current ||
          document.querySelector('.CourseDetailPanel');
        if (el) {
          el.scrollIntoView(smooth);
          onCourseDetailReady(el);
        }
      }
      if (!canceled) setTriggerScroll(false);
    };
    doScroll();
    return () => {
      canceled = true;
    };
  }, [selectedCourse, triggerScroll]); // Depend on selectedCourse and triggerScroll

  const isMobile = useIsMobile('(max-width: 767px)');

  const handleOpenMobileDetails = (course) => {
    navigate({
      to: '/cursos/$slug',
      params: { slug: course.nombre_corto },
      state: { course },
    });
  };

  // No dialog/body locking in the new navigation flow

  const formatDateRange = (curso) => fmtCourseRange(curso);

  // Mobile-first prototype: stacked cards
  if (isMobile) {
    return (
      <div
        id="cursos"
        className="CursosAccordion NavigationBarScrollOffset"
        ref={refListaCursos}
      >
        {loading ? (
          <div className="LoaderContainer LoaderContainer--onDark">
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
        ) : (
          <div className="CursosCardList">
            {Object.values(tiposCurso).map((tipoCurso) => (
              <div key={tipoCurso.nombre_corto} className="CourseCard">
                <img
                  className="CourseCardImage"
                  src={`static/images/${tipoCurso.foto}`}
                  alt={tipoCurso.nombre_corto}
                  loading="lazy"
                />
                <div className="CourseCardBody">
                  <h3 className="CourseCardTitle">
                    {tipoCurso.nombre_completo}
                  </h3>
                  <p className="CourseCardSummary">
                    {tipoCurso.resumen_una_linea}
                  </p>
                  <div className="CourseCardActions">
                    <button
                      type="button"
                      className="CourseCardSecondary"
                      onClick={() => handleOpenMobileDetails(tipoCurso)}
                    >
                      Ver más detalles
                    </button>
                    <details className="CourseCardDetails">
                      <summary className="CourseCardPrimary">
                        Ver fechas
                      </summary>
                      <div className="CourseCardDetailsBody">
                        {tipoCurso.upcoming_courses &&
                        tipoCurso.upcoming_courses.length > 0 ? (
                          <ul className="CourseDateList">
                            {tipoCurso.upcoming_courses.map((c) => (
                              <li key={c.id} className="CourseDateRow">
                                <div className="CourseDateText">
                                  <strong>
                                    {formatDateRange(c) || 'Fecha a confirmar'}
                                  </strong>
                                  {c.hora_inicio && c.hora_fin && (
                                    <span>
                                      {' '}
                                      • {c.hora_inicio}–{c.hora_fin}
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>
                            No hay próximas fechas. Únete a la lista de espera.
                          </p>
                        )}
                        <div className="CourseStickyBar">
                          <MobileEnrollButton tipoCurso={tipoCurso} />
                        </div>
                        {Array.isArray(tipoCurso.contenido) &&
                        tipoCurso.contenido.length ? (
                          <div className="CourseCardContents">
                            <h4 className="CourseCardContentsTitle">
                              ¿Qué vas a aprender?
                            </h4>
                            <CourseContentsList modules={tipoCurso.contenido} />
                          </div>
                        ) : null}
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Drawer removed: navigation takes over */}
      </div>
    );
  }

  // Desktop: keep existing carousel behavior
  return (
    <div
      id="cursos"
      className="CursosAccordion NavigationBarScrollOffset"
      ref={refListaCursos}
    >
      <div className="CursosHeader">
        {loading ? (
          <div className="LoaderContainer LoaderContainer--onDark">
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
        ) : (
          <ToggleGroup.Root
            ref={sliderRef}
            type="single"
            onValueChange={updateSelectedItem}
            className="ResumenCursosCarousel"
            value={selectedCourse ?? undefined}
          >
            {Object.values(tiposCurso).map((tipoCurso) => (
              <ToggleGroup.Item
                className="ToggleResumenCurso"
                value={tipoCurso.nombre_corto}
                key={tipoCurso.nombre_corto}
              >
                <div className="ContenedorImagenResumenCurso">
                  <img
                    src={
                      selectedCourse === tipoCurso.nombre_corto
                        ? `static/images/${tipoCurso.foto}`
                        : `static/images/${tipoCurso.foto_tint}`
                    }
                    className="ImagenResumenCurso"
                    alt={tipoCurso.nombre_corto}
                  />
                </div>

                <div className="TextoResumenCurso">
                  <h3 className="CursosTituloAcronimo">
                    {tipoCurso.nombre_corto}
                  </h3>
                  <h4 className="CursosTitulo">{tipoCurso.nombre_completo}</h4>
                  <p className="CursosTituloBajada">
                    {tipoCurso.resumen_una_linea}
                  </p>
                </div>
                <span className="CircleButton CircleButtonCursos" />
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        )}
      </div>
      {selectedCourse && !loading && (
        <Suspense fallback={<div data-testid="detalle-curso-loading" />}>
          <LazyCourseDetailPanel
            ref={refCourseDetailPanel}
            tipoCurso={tiposCurso[selectedCourse]}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Cursos;

export function __clearCursosCache() {
  cachedTiposCurso = null;
}

function MobileEnrollButton({ tipoCurso }) {
  const openCheckout = useOpenCheckout();
  return (
    <button
      data-testid="inscripcion-open"
      className="btn btn--primary"
      onClick={() =>
        openCheckout({
          idCurso: tipoCurso?.upcoming_courses?.[0]?.id,
          nombreCorto: tipoCurso.nombre_corto,
          costoUSD: tipoCurso.costo_usd,
          costoARS: tipoCurso.costo_ars,
        })
      }
    >
      Inscribirme
    </button>
  );
}
