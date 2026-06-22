import React, { useEffect, useRef, useState } from 'react';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';

const servicios = [
  {
    titulo: 'Consultoría organizacional',
    descripcion:
      'Diagnóstico y rediseño de estructuras, flujos de trabajo, incentivos y coordinación entre equipos para eliminar cuellos de botella y ganar adaptabilidad.',
  },
  {
    titulo: 'Facilitación estratégica',
    descripcion:
      'Consenso accionable entre stakeholders con intereses en conflicto.',
  },
  {
    titulo: 'Programas de liderazgo',
    descripcion:
      'Autogestión de equipos, mejora continua, colaboración entre áreas.',
  },
  {
    titulo: 'Formación',
    descripcion:
      'Más de 4000 profesionales formados en agilidad organizacional en 4 continentes.',
  },
];

// RoughNotation draws annotations at the target's coordinates when shown and
// only repositions on window resize — not on layout shifts. We tie `show` to
// viewport intersection (which fires on both scroll and layout changes): when
// the Hero accordion above expands and pushes this section out of view, the
// stale overlays are hidden, then redrawn at the correct spot on re-entry.
const useRedrawInView = () => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setShow(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, show };
};

const ComoTrabajo = () => {
  const { ref, show } = useRedrawInView();
  return (
    <section
      ref={ref}
      className="ComoTrabajoSection NavigationBarScrollOffset"
      id="como-trabajo"
    >
      <RoughNotationGroup show={show}>
        <RoughNotation
          type="underline"
          color="#7b68ee"
          animate={true}
          strokeWidth={5}
          iterations={4}
          padding={6}
        >
          <h2 className="ComoTrabajoTitulo">Cómo trabajo</h2>
        </RoughNotation>
        <div className="ComoTrabajoGrid">
          {servicios.map(({ titulo, descripcion }) => (
            <article key={titulo} className="ComoTrabajoCard">
              <RoughNotation
                type="underline"
                color="#7b68ee"
                animate={true}
                strokeWidth={4}
                iterations={5}
                padding={4}
              >
                <h3 className="ComoTrabajoCardTitulo">{titulo}</h3>
              </RoughNotation>
              <p className="ComoTrabajoCardTexto">{descripcion}</p>
            </article>
          ))}
        </div>
      </RoughNotationGroup>
    </section>
  );
};

export default ComoTrabajo;
