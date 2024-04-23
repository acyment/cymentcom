import React, { useEffect, useState, forwardRef } from 'react';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import EllipsisNestedList from './EllipsisNestedList';
import HorarioCurso from './HorarioCurso';
import FAQ from './FAQ';
import MuxPlayer from '@mux/mux-player-react';
import parse from 'html-react-parser';

const DetalleCurso = forwardRef(({ tipoCurso }, ref) => {
  return (
    <div
      ref={ref}
      id="detalle-curso"
      className="DetalleCurso NavigationBarScrollOffset"
    >
      <p className="SubtituloDetalleCurso">Próximos cursos</p>
      <HorarioCurso tipoCurso={tipoCurso.upcoming_courses} />
      <p className="ResumenDetalleCurso">
        Lunes a viernes, en 5 sesiones diarias de 3,5 hs cada una
      </p>
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
      <FAQ />
    </div>
  );
});

export default DetalleCurso;
