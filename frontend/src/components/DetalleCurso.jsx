import React, { useEffect, useState, forwardRef } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import EllipsisNestedList from './EllipsisNestedList';
import HorarioCurso from './HorarioCurso';
import FAQ from './FAQ';
import MuxPlayer from '@mux/mux-player-react';

const DetalleCurso = forwardRef(({ type }, ref) => {
  let [content, setContent] = useState({});

  useEffect(() => {
    switch (type) {
      case 'CSM':
        setContent({
          videoURL: 'https://youtu.be/O8RnYmiux5E',
          title: 'Certified ScrumMaster (CSM)',
          summary:
            'Introducción a la agilidad más profunda. Reflexión intensa sobre el mundo del trabajo. Catarata de trucos sobre el rol del ScrumMaster. Mucho más que un simple curso.',
          fullContents: (
            <ul>
              <li>
                Filosofía de la agilidad
                <ul>
                  <li>
                    Complejidad, el por qué de la agilidad
                    <ul>
                      <li>Mapa de la complejidad</li>
                      <li>Complicado no es lo mismo que complejo</li>
                      <li>La niebla y el sol, otra analogía</li>
                      <li>Predictibilidad versus aprendizaje</li>
                      <li>Velocidad versus adaptabilidad</li>
                    </ul>
                  </li>
                  <li>
                    La propuesta de la agilidad
                    <ul>
                      <li>
                        Desarrollo orgánico versus mecánico
                        <ul>
                          <li>Corte orgánico</li>
                          <li>Velocidad de aprendizaje</li>
                        </ul>
                      </li>
                      <li>
                        Foco y flujo
                        <ul>
                          <li>Una mini-simulación</li>
                          <li>Dolores y causas del multitasking</li>
                        </ul>
                      </li>
                      <li>
                        Una nueva definición de éxito
                        <ul>
                          <li>Output y outcome</li>
                          <li>Éxito en términos de output</li>
                          <li>Éxito para escenarios complejos</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li>
                Scrum
                <ul>
                  <li>Scrum, output, outcome, foco y desarrollo orgánico</li>
                  <li>
                    Roles
                    <ul>
                      <li>
                        Taxonomía de Product Owners
                        <ul>
                          <li>El tapón</li>
                          <li>El Steve Jobs</li>
                          <li>El facilitador</li>
                        </ul>
                      </li>
                      <li>
                        De ScrumMasters y abejorros
                        <ul>
                          <li>Su lógica diaria</li>
                          <li>Antipatrones usuales</li>
                          <li>ScrumMaster versus Project Manager</li>
                        </ul>
                      </li>
                      <li>Especialización versus diversificación en equipos</li>
                    </ul>
                  </li>
                  <li>
                    Sprint
                    <ul>
                      <li>Pronóstico versus objetivo de Sprint</li>
                      <li>Dailies dolorosas</li>
                      <li>Ordenando el Refinamiento</li>
                      <li>Revisiones maduras</li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li>
                ScrumMastering en acción (temas optativos)
                <ul>
                  <li>
                    Teoría de facilitación
                    <ul>
                      <li>Conflicto y colaboración</li>
                    </ul>
                  </li>
                  <li>
                    Retrospectivas más profundas
                    <ul>
                      <li>Esqueleto de una buena retrospectiva</li>
                    </ul>
                  </li>
                  <li>
                    Cambio organizacional
                    <ul>
                      <li>Consejos estratégicos</li>
                      <li>Un proceso para el día a día</li>
                    </ul>
                  </li>
                  <li>
                    Introducción al escalado
                    <ul>
                      <li>Eliminar dependencias versus administrarlas</li>
                      <li>La propuesta de LeSS</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          ),
          truncatedContents: (
            <ul>
              <li>
                Filosofía de la agilidad
                <ul>
                  <li>
                    Complejidad, el por qué de la agilidad
                    <ul>
                      <li>Mapa de la complejidad</li>
                      <li>Complicado no es lo mismo que complejo</li>
                      <li>La niebla y el sol, otra analogía</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          ),
        });
        break;
      case 'CSPO':
        setContent({
          videoURL: 'https://www.youtube.com/watch?v=VK8kIYqD0Y8',
          title: 'Certified Scrum Product Owner',
          summary:
            'Introducción a la agilidad más profunda. Reflexión intensa sobre el mundo del trabajo. Catarata de trucos sobre el rol del ScrumMaster. Mucho más que un simple curso.',
          fullContents: (
            <>
              <ul>
                <li>Certified ScrumMaster (CSM)</li>
                <ul>
                  <li>Video</li>
                  <li>
                    Introducci&oacute;n a la agilidad m&aacute;s profunda.
                    Reflexi&oacute;n intensa sobre el mundo del trabajo.
                    Catarata de trucos sobre el rol del ScrumMaster. Mucho
                    m&aacute;s que un simple curso.
                  </li>
                  <li>Contenidos</li>
                  <ul>
                    <li>Filosof&iacute;a de la agilidad</li>
                  </ul>
                </ul>
              </ul>
              <ul>
                <li>Complejidad, el por qu&eacute; de la agilidad</li>
                <ul>
                  <li>Mapa de la complejidad</li>
                  <li>Complicado no es lo mismo que complejo</li>
                  <li>La niebla y el sol, otra analog&iacute;a</li>
                  <li>Predictibilidad versus aprendizaje</li>
                  <li>Velocidad versus adaptabilidad</li>
                </ul>
                <li>La propuesta de la agilidad</li>
                <ul>
                  <li>Desarrollo org&aacute;nico versus mec&aacute;nico</li>
                  <ul>
                    <li>Corte org&aacute;nico</li>
                    <li>Velocidad de aprendizaje</li>
                  </ul>
                  <li>Foco y flujo</li>
                  <ul>
                    <li>Una mini-simulaci&oacute;n</li>
                    <li>Dolores y causas del multitasking</li>
                  </ul>
                  <li>Una nueva definici&oacute;n de &eacute;xito</li>
                  <ul>
                    <li>Output y outcome</li>
                    <li>&Eacute;xito en t&eacute;rminos de output</li>
                    <li>&Eacute;xito para escenarios complejos</li>
                  </ul>
                </ul>
                <li>Scrum</li>
              </ul>
              <ul>
                <li>
                  Scrum, output, outcome, foco y desarrollo org&aacute;nico
                </li>
                <li>Roles</li>
                <ul>
                  <li>Taxonom&iacute;a de Product Owners</li>
                  <ul>
                    <li>El tap&oacute;n</li>
                    <li>El Steve Jobs</li>
                    <li>El facilitador</li>
                  </ul>
                  <li>De ScrumMasters y abejorros</li>
                  <ul>
                    <li>Su l&oacute;gica diaria</li>
                    <li>Antipatrones usuales</li>
                    <li>ScrumMaster versus Project Manager</li>
                  </ul>
                  <li>
                    Especializaci&oacute;n versus diversificaci&oacute;n en
                    equipos
                  </li>
                </ul>
                <li>Sprint</li>
                <ul>
                  <li>Pron&oacute;stico versus objetivo de Sprint</li>
                  <li>Dailies dolorosas</li>
                  <li>Ordenando el Refinamiento</li>
                  <li>Revisiones maduras</li>
                </ul>
                <li>ScrumMastering en acci&oacute;n (temas optativos)</li>
              </ul>
              <ul>
                <li>Teor&iacute;a de facilitaci&oacute;n</li>
                <ul>
                  <li>Conflicto y colaboraci&oacute;n</li>
                </ul>
                <li>Retrospectivas m&aacute;s profundas</li>
                <ul>
                  <li>Esqueleto de una buena retrospectiva</li>
                </ul>
                <li>Cambio organizacional</li>
                <ul>
                  <li>Consejos estrat&eacute;gicos</li>
                  <li>Un proceso para el d&iacute;a a d&iacute;a</li>
                </ul>
                <li>Introducci&oacute;n al escalado</li>
                <ul>
                  <li>Eliminar dependencias versus administrarlas</li>
                  <li>La propuesta de LeSS</li>
                </ul>
              </ul>
            </>
          ),
          truncatedContents: (
            <ul>
              <li>
                Filosofía de la agilidad
                <ul>
                  <li>
                    Complejidad, el por qué de la agilidad
                    <ul>
                      <li>Mapa de la complejidad</li>
                      <li>Complicado no es lo mismo que complejo</li>
                      <li>La niebla y el sol, otra analogía</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          ),
        });
        break;
      case 'LESS':
        content = {};
        break;
    }
  }, [type]);

  return (
    <div
      ref={ref}
      id="detalle-curso"
      className="DetalleCurso NavigationBarScrollOffset"
    >
      <p className="SubtituloDetalleCurso">Próximos cursos</p>
      <HorarioCurso />
      <p className="ResumenDetalleCurso">
        Lunes a viernes, en 5 sesiones diarias de 3,5 hs cada una
      </p>
      <hr className="Separador" />
      <MuxPlayer
        streamType="on-demand"
        playbackId="UxJyrVzp289RvfPfMeVNgGNlm01Fh9MDilKVV00zq4dKc"
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
        animate={true}
        iterations={5}
      >
        <p className="TituloDetalleCurso">{content.title}</p>
      </RoughNotation>
      <p className="ResumenDetalleCurso">{content.summary}</p>
      <p className="SubtituloDetalleCurso">Contenidos</p>
      <EllipsisNestedList
        fullContents={content.fullContents}
        truncatedContents={content.truncatedContents}
        maxItems={5}
      ></EllipsisNestedList>
      <hr className="Separador" />

      <p className="SubtituloDetalleCurso">FAQ</p>
      <FAQ />
    </div>
  );
});

export default DetalleCurso;
