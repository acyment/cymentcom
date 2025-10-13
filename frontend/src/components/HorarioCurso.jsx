import React, { Fragment, useMemo } from 'react';
import { usePostHog } from 'posthog-js/react';

import { useOpenCheckout } from '@/features/checkout/useOpenCheckout';
import formatDate from 'intl-dateformat';
import { adjustTimeZone, calculateTimeDifference } from '@/utils/courseTime';

const HorarioCurso = ({ proximosCursos, nombreCorto, costoUSD, costoARS }) => {
  const proximoCurso = proximosCursos?.[0] ?? null;
  const fechaCurso = useMemo(() => {
    if (!proximoCurso?.fecha) {
      return null;
    }
    const calculated = new Date(proximoCurso.fecha);
    calculated.setUTCHours(12);
    return calculated;
  }, [proximoCurso?.fecha]);
  const fechaFinCurso = useMemo(() => {
    if (!fechaCurso || !proximoCurso?.cantidad_dias) {
      return null;
    }
    const endDate = new Date(fechaCurso);
    endDate.setDate(fechaCurso.getDate() + proximoCurso.cantidad_dias - 1);
    return endDate;
  }, [fechaCurso, proximoCurso?.cantidad_dias]);
  const hayFechas = Boolean(proximoCurso && fechaCurso);
  const fechaFinParaResumen = fechaFinCurso ?? fechaCurso;
  const posthog = usePostHog();

  const openCheckout = useOpenCheckout();

  function capitalizeFirstLetter(str) {
    if (str.length === 0) {
      return str; // Handle empty string case
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <Fragment>
      <div className="HorarioCurso">
        <div className="ContenedorFechaCurso">
          <img
            src="/static/images/noun-calendar-6641614.svg"
            className="ImagenCalendarioHorarioCurso"
            width="157"
            height="169"
          />
          <div className="FechaCurso">
            <p className="MesFechaCurso">
              {hayFechas &&
                formatDate(fechaCurso, 'MMM', {
                  locale: 'es-AR',
                }).toUpperCase()}
            </p>
            <p className="DiaFechaCurso">
              {hayFechas && fechaCurso?.getDate()}
            </p>
          </div>
        </div>
        <div className="DesdeHasta">
          <p className="DesdeHastaFecha">
            Desde el{' '}
            {hayFechas &&
              formatDate(fechaCurso, 'dddd DD', { locale: 'es-AR' })}
            <br />
            al{' '}
            {hayFechas &&
              formatDate(fechaFinParaResumen, 'dddd DD', {
                locale: 'es-AR',
              })}{' '}
            de{' '}
            {hayFechas &&
              formatDate(fechaCurso, 'MMMM', { locale: 'es-AR' }) +
                ' de ' +
                formatDate(fechaCurso, 'YYYY', { locale: 'es-AR' })}
          </p>
          <p className="HorariosOtrosPaises">
            MEX/CRI [GMT-6]{' '}
            {proximoCurso && adjustTimeZone(proximoCurso.hora_inicio, -3, -6)} a{' '}
            {proximoCurso && adjustTimeZone(proximoCurso.hora_fin, -3, -6)} hs.
            <br /> ECU/PER [GMT-5]{' '}
            {proximoCurso &&
              adjustTimeZone(proximoCurso.hora_inicio, -3, -5)} a{' '}
            {proximoCurso && adjustTimeZone(proximoCurso.hora_fin, -3, -5)} hs.
            <br />
            ARG/URU [GMT-3] {proximoCurso && proximoCurso.hora_inicio} a{' '}
            {proximoCurso && proximoCurso.hora_fin} hs.
          </p>
        </div>
        {proximoCurso ? (
          <button
            data-testid="inscripcion-open"
            className="BotonInscripcion"
            onClick={() => {
              posthog.capture('Boton inscripcion ' + proximoCurso.id);
              openCheckout({
                idCurso: proximoCurso.id,
                nombreCorto,
                costoUSD,
                costoARS,
              });
            }}
            autoFocus={true}
          >
            Inscribirme
          </button>
        ) : (
          <button className="BotonInscripcion" disabled>
            Cargando...
          </button>
        )}
      </div>
      <p className="ResumenCourseDetailPanel">
        {hayFechas ? (
          <>
            {capitalizeFirstLetter(
              formatDate(fechaCurso, 'dddd', { locale: 'es-AR' }),
            )}{' '}
            a{' '}
            {formatDate(fechaFinParaResumen, 'dddd', {
              locale: 'es-AR',
            })}{' '}
            en {proximoCurso.cantidad_dias} sesiones diarias de{' '}
            {calculateTimeDifference(
              proximoCurso.hora_inicio,
              proximoCurso.hora_fin,
            )}{' '}
            hs cada una
          </>
        ) : (
          'Cargando detalles del curso...'
        )}
      </p>
    </Fragment>
  );
};

export default HorarioCurso;
