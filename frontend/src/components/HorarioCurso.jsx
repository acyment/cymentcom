import React, { Fragment, useEffect, useState } from 'react';

import Inscripcion from './Inscripcion';
import { Dialog, Portal } from '@ark-ui/react';
import formatDate from 'intl-dateformat';

const HorarioCurso = ({ proximosCursos }) => {
  const header = document.querySelector('header');
  const [proximoCurso, setProximoCurso] = useState(null);
  const [fechaCurso, setFechaCurso] = useState(null);

  useEffect(() => {
    if (proximosCursos) {
      setProximoCurso(proximosCursos[0]);
      // TODO: Manejar el caso en el que hay muchas próximas fechas
      setFechaCurso(new Date(proximosCursos[0].fecha));
    }
  }, [proximosCursos]);

  const handleDialogOpenChange = (open) => {
    if (open) {
      turnOffHeaderStickiness();
    } else {
      turnOnHeaderStickiness();
    }
  };

  const turnOffHeaderStickiness = () => {
    header.style.position = 'relative';
  };

  const turnOnHeaderStickiness = () => {
    header.style.position = 'sticky';
  };

  const calculateTimeDifference = (startTime, endTime) => {
    // Create Date objects from the time strings
    const startDate = new Date(`2000-01-01T${startTime}`);
    const endDate = new Date(`2000-01-01T${endTime}`);

    // Calculate the difference in milliseconds
    const diffInMilliseconds = endDate - startDate;

    // Convert milliseconds to hours
    return diffInMilliseconds / (1000 * 60 * 60);
  };

  const adjustTimeZone = (timeString, fromTimeZone, toTimeZone) => {
    // Split the time string into hours and minutes
    const [hours, minutes] = timeString.split(':');

    // Create a Date object for the current date at the given time in UTC-3
    const date = new Date();
    date.setUTCHours(hours, minutes);

    // Calculate the time zone difference in hours
    const timeZoneDifference = toTimeZone - fromTimeZone;

    // Adjust the time for the time zone difference
    date.setUTCHours(date.getUTCHours() + timeZoneDifference);

    // Format the result back into a string in the "HH:MM" format
    const adjustedHours = date.getUTCHours().toString().padStart(2, '0');
    const adjustedMinutes = date.getUTCMinutes().toString().padStart(2, '0');

    return `${adjustedHours}:${adjustedMinutes}`;
  };

  return (
    <Fragment>
      <div className="HorarioCurso">
        <div className="ContenedorFechaCurso">
          <img
            src="static/images/noun-calendar-6641614.svg"
            className="ImagenCalendarioHorarioCurso"
          />
          <div className="FechaCurso">
            <p className="MesFechaCurso">
              {proximoCurso &&
                formatDate(fechaCurso, 'MMM', {
                  locale: 'es-AR',
                }).toUpperCase()}
            </p>
            <p className="DiaFechaCurso">
              {proximoCurso && fechaCurso.getDate()}
            </p>
          </div>
        </div>
        <div className="DesdeHasta">
          <p className="DesdeHastaFecha">
            Desde el{' '}
            {proximoCurso &&
              formatDate(fechaCurso, 'dddd DD', { locale: 'es-AR' })}
            <br />
            al{' '}
            {proximoCurso &&
              formatDate(
                fechaCurso.setDate(
                  fechaCurso.getDate() + proximoCurso.cantidad_dias - 1,
                ),
                'dddd DD',
                {
                  locale: 'es-AR',
                },
              )}{' '}
            de{' '}
            {proximoCurso &&
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
        <Dialog.Root
          onOpenChange={handleDialogOpenChange}
          modal={true}
          closeOnInteractOutside={false}
        >
          <Dialog.Trigger asChild>
            <button className="BotonInscripcion">Inscribirme</button>
          </Dialog.Trigger>

          <Portal>
            <Dialog.Backdrop className="DialogOverlay" />
            <Dialog.Positioner>
              <Dialog.Content className="DialogContent">
                <Inscripcion idCurso={proximoCurso && proximoCurso.id} />
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </div>
      <p className="ResumenDetalleCurso">
        {proximoCurso && formatDate(fechaCurso, 'dddd', { locale: 'es-AR' })} a{' '}
        {proximoCurso &&
          formatDate(
            fechaCurso.setDate(
              fechaCurso.getDate() + proximoCurso.cantidad_dias - 1,
            ),
            'dddd',
            {
              locale: 'es-AR',
            },
          )}
        , en {proximoCurso && proximoCurso.cantidad_dias} sesiones diarias de{' '}
        {proximoCurso &&
          calculateTimeDifference(
            proximoCurso.hora_inicio,
            proximoCurso.hora_fin,
          )}{' '}
        hs cada una
      </p>
    </Fragment>
  );
};

export default HorarioCurso;
