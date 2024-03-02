import React from 'react';
const HorarioCurso = () => {
  return (
    <div className="HorarioCurso">
      <div className="ContenedorFechaCurso">
        <img src="static/images/noun-calendar-6641614.svg" />
        <div className="FechaCurso">
          <p className="MesFechaCurso">NOV</p>
          <p className="DiaFechaCurso">14</p>
        </div>
      </div>
      <div className="DesdeHasta">
        <p className="DesdeHastaFecha">
          Desde el lunes 06
          <br />
          al viernes 10 de noviembre 2023
        </p>
        <p className="HorariosOtrosPaises">
          MEX/CRI [GMT-6] 12:00 a 15:30 hs.
          <br /> ECU/PER [GMT-5] 13:00 a 16:30 hs.
          <br />
          ARG/CHI/PAR/URU [GMT-3] 15:00 a 18:30 hs.
        </p>
      </div>
      <button className="BotonInscripcion">Inscribirme</button>
    </div>
  );
};

export default HorarioCurso;
