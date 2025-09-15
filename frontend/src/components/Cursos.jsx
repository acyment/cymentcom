import React, { useState, useRef, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import DetalleCurso from './DetalleCurso';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import axios from 'axios';
import CircleLoader from 'react-spinners/CircleLoader';
import * as Dialog from '@radix-ui/react-dialog';
import Inscripcion from './Inscripcion';
import { useIsMobile } from '@/hooks/useIsMobile';

const Cursos = () => {
  const [tiposCurso, setTiposCurso] = useState([]);

  const refDetalleCurso = useRef(null);
  const refListaCursos = useRef(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [triggerScroll, setTriggerScroll] = useState(false);
  const posthog = usePostHog();
  const [loading, setLoading] = useState(true);
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
    const fetchData = async () => {
      setLoading(true);
      try {
        // Replace 'your_api_endpoint' with the actual endpoint URL
        const response = await axios.get('/api/tipos-de-curso');
        const dictTiposCurso = response.data.reduce((acc, obj) => {
          acc[obj.nombre_corto] = obj;
          return acc;
        }, {});
        setTiposCurso(dictTiposCurso);
      } catch (error) {
        console.error('Error fetching data: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    if (triggerScroll) {
      if (selectedCourse === '')
        refListaCursos.current.scrollIntoView({ behavior: 'smooth' });
      else if (refDetalleCurso.current)
        refDetalleCurso.current.scrollIntoView({ behavior: 'smooth' });
      setTriggerScroll(false); // Reset trigger after scroll
    }
  }, [selectedCourse, triggerScroll]); // Depend on selectedCourse and triggerScroll

  const isMobile = useIsMobile('(max-width: 767px)');

  // Mobile-first prototype: stacked cards
  if (isMobile) {
    const formatDateRange = (curso) => {
      try {
        if (!curso?.fecha) return null;
        const start = new Date(curso.fecha);
        const end = new Date(start);
        if (curso.cantidad_dias && curso.cantidad_dias > 1) {
          end.setDate(start.getDate() + (curso.cantidad_dias - 1));
        }
        const fmtDay = (d) =>
          d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit' });
        const monthYear = start.toLocaleDateString('es-AR', {
          month: 'long',
          year: 'numeric',
        });
        return `${fmtDay(start)} al ${fmtDay(end)} de ${monthYear}`;
      } catch (e) {
        return null;
      }
    };
    return (
      <div
        id="cursos"
        className="CursosAccordion NavigationBarScrollOffset"
        ref={refListaCursos}
      >
        {loading ? (
          <div
            className="LoaderContainer"
            style={{ display: 'flex', justifyContent: 'center', padding: 40 }}
          >
            <CircleLoader color="#36D7B7" size={60} />
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
                          <Dialog.Root>
                            <Dialog.Trigger asChild>
                              <button
                                data-testid="inscripcion-open"
                                className="btn btn--primary"
                              >
                                Inscribirme
                              </button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                              <Dialog.Overlay className="DialogOverlay" />
                              <Dialog.Content className="DialogContent">
                                <Inscripcion
                                  idCurso={tipoCurso?.upcoming_courses?.[0]?.id}
                                  nombreCorto={tipoCurso.nombre_corto}
                                  costoUSD={tipoCurso.costo_usd}
                                  costoARS={tipoCurso.costo_ars}
                                />
                              </Dialog.Content>
                            </Dialog.Portal>
                          </Dialog.Root>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <div
            className="LoaderContainer"
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <CircleLoader color="#36D7B7" size={60} />
          </div>
        ) : (
          <ToggleGroup.Root
            ref={sliderRef}
            type="single"
            onValueChange={updateSelectedItem}
            className="ResumenCursosCarousel"
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
        <DetalleCurso
          ref={refDetalleCurso}
          tipoCurso={tiposCurso[selectedCourse]}
        />
      )}
    </div>
  );
};

export default Cursos;
