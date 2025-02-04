import React, { useEffect, useState, forwardRef } from 'react';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import EllipsisNestedList from './EllipsisNestedList';
import HorarioCurso from './HorarioCurso';
import FAQ from './FAQ';
import CostoCurso from './CostoCurso';
import MuxPlayer from '@mux/mux-player-react';
import parse from 'html-react-parser';

const DetalleCurso = forwardRef(({ tipoCurso }, ref) => {
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
          <HorarioCurso proximosCursos={tipoCurso.upcoming_courses} />
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
      <MuxPlayer
        streamType="on-demand"
        playbackId={tipoCurso.video}
        metadataVideoTitle="Placeholder (optional)"
        metadataViewerUserId="Placeholder (optional)"
        primaryColor="#FFFFFF"
        secondaryColor="#000000"
        className="VideoPlayer"
      />
      <RoughNotation
        type="underline"
        color="#7b68ee"
        show={true}
        iterations={5}
      >
        <p className="TituloDetalleCurso">{tipoCurso.nombre_completo}</p>
      </RoughNotation>
      <p className="ResumenDetalleCurso">{tipoCurso.resumen}</p>
      <p className="SubtituloDetalleCurso">Contenidos</p>
      <EllipsisNestedList
        fullContents={parse(tipoCurso.contenido)}
        truncatedContents={parse(tipoCurso.contenido_corto)}
        maxItems={5}
      ></EllipsisNestedList>
      <hr className="Separador" />

      <p className="SubtituloDetalleCurso">FAQ</p>
      <FAQ faqEntries={tipoCurso.faq_entries} />
      <CostoCurso
        costoUSD={tipoCurso.costo_usd}
        costoARS={tipoCurso.costo_ars}
        costoSinDescuentoARS={tipoCurso.costo_sin_descuento_ars}
      />
    </div>
  );
});

export default DetalleCurso;
