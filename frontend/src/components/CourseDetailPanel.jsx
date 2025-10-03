import React, { forwardRef } from 'react';
import { RoughNotation } from 'react-rough-notation';
import CourseContentsAccordion from './CourseContentsAccordion';
import HorarioCurso from './HorarioCurso';
import FAQ from './FAQ';
import CostoCurso from './CostoCurso';
import ResilientMuxPlayer from './ResilientMuxPlayer';
import { USE_INLINE_VIDEO } from '@/features/video/videoFlags';
import MuxMp4Video from '@/features/video/MuxMp4Video';

const CourseDetailPanel = forwardRef(({ tipoCurso }, ref) => {
  function hayProximasFechas() {
    return tipoCurso.upcoming_courses.length > 0;
  }

  return (
    <div
      ref={ref}
      id="detalle-curso"
      className="DetalleCurso NavigationBarScrollOffset"
    >
      {hayProximasFechas() && (
        <div id="calendario-curso">
          <p className="SubtituloDetalleCurso">Próximos cursos</p>
          <HorarioCurso
            proximosCursos={tipoCurso.upcoming_courses}
            nombreCorto={tipoCurso.nombre_corto}
            costoUSD={tipoCurso.costo_usd}
            costoARS={tipoCurso.costo_ars}
          />
        </div>
      )}
      {!hayProximasFechas() && (
        <div id="calendario-curso" className="NavigationBarScrollOffset">
          <p className="SubtituloDetalleCurso">
            No hay próximas fechas de este curso
          </p>
          <a href="#contacto">¿Interesado en la versión in-company?</a>
        </div>
      )}
      <hr className="Separador" />
      <CostoCurso
        costoUSD={tipoCurso.costo_usd}
        costoARS={tipoCurso.costo_ars}
        costoSinDescuentoARS={tipoCurso.costo_sin_descuento_ars}
        costoSinDescuentoUSD={tipoCurso.costo_sin_descuento_usd}
        proximoCurso={tipoCurso.upcoming_courses?.[0]}
        nombreCorto={tipoCurso.nombre_corto}
      />
      <hr className="Separador" />
      <p className="SubtituloDetalleCurso">Conoce a tu instructor</p>
      {USE_INLINE_VIDEO ? (
        <MuxMp4Video playbackId={tipoCurso.video} className="VideoPlayer" />
      ) : (
        <ResilientMuxPlayer
          streamType="on-demand"
          playbackId={tipoCurso.video}
          primaryColor="#FFFFFF"
          secondaryColor="#000000"
          className="VideoPlayer"
        />
      )}
      <RoughNotation
        type="underline"
        color="#7b68ee"
        show={true}
        iterations={5}
      >
        <p className="TituloDetalleCurso">{tipoCurso.nombre_completo}</p>
      </RoughNotation>
      <p className="ResumenDetalleCurso">{tipoCurso.resumen}</p>
      <p className="SubtituloDetalleCurso">¿Qué vas a aprender?</p>
      {Array.isArray(tipoCurso.contenido) && tipoCurso.contenido.length ? (
        <CourseContentsAccordion modules={tipoCurso.contenido} />
      ) : (
        <p>Pronto publicaremos el temario.</p>
      )}
      <hr className="Separador" />

      <p className="SubtituloDetalleCurso">Preguntas frecuentes</p>
      <FAQ faqEntries={tipoCurso.faq_entries} />
    </div>
  );
});

export default CourseDetailPanel;
