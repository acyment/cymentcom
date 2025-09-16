import React from 'react';
import { useSearch } from '@tanstack/react-router';
import Inscripcion from '@/components/Inscripcion';

export function CheckoutFlow() {
  // Expect course details via search to render the real form
  const search = useSearch({ from: '/' });
  const idCurso = search?.idCurso || search?.course_id;
  const nombreCorto = search?.nombreCorto || search?.course_name;
  const costoUSD = search?.costoUSD || search?.price_usd;
  const costoARS = search?.costoARS || search?.price_ars;

  if (!idCurso || (!costoUSD && !costoARS)) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Seleccioná un curso para continuar</h2>
        <p>
          No encontramos los datos del curso. Abrí el checkout desde un curso o
          pasá los parámetros en la URL (por ejemplo: idCurso, nombreCorto,
          costoUSD/costoARS).
        </p>
      </div>
    );
  }

  return (
    <Inscripcion
      idCurso={idCurso}
      nombreCorto={nombreCorto}
      costoUSD={costoUSD}
      costoARS={costoARS}
    />
  );
}

export default CheckoutFlow;
