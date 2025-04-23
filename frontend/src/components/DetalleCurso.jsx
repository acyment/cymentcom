import React, { useEffect, useState, forwardRef } from 'react';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import EllipsisNestedList from './EllipsisNestedList';
import HorarioCurso from './HorarioCurso';
import FAQ from './FAQ';
import CostoCurso from './CostoCurso';
import ResilientMuxPlayer from './ResilientMuxPlayer';
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
      <ResilientMuxPlayer
        streamType="on-demand"
        playbackId={tipoCurso.video}
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
        costoSinDescuentoUSD={tipoCurso.costo_sin_descuento_usd}
      />
    </div>
  );
});

export default DetalleCurso;
