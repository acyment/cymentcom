import React, { useEffect, useState } from 'react';
import * as Separator from '@radix-ui/react-separator';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Dialog from '@radix-ui/react-dialog';

const DetalleCurso = ({ type }) => {
  let [content, setContent] = useState({});

  useEffect(() => {
    switch (type) {
      case 'CSM':
        setContent({
          videoURL: 'https://www.youtube.com/watch?v=VK8kIYqD0Y8',
          title: 'Certified ScrumMaster',
          summary:
            'Introducción a la agilidad más profunda. Reflexión intensa sobre el mundo del trabajo. Catarata de trucos sobre el rol del ScrumMaster. Mucho más que un simple curso.',
          contents: (
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
        });
        break;
      case 'CSPO':
        setContent({
          videoURL: 'https://www.youtube.com/watch?v=VK8kIYqD0Y8',
          title: 'Certified Scrum Product Owner',
          summary:
            'Introducción a la agilidad más profunda. Reflexión intensa sobre el mundo del trabajo. Catarata de trucos sobre el rol del ScrumMaster. Mucho más que un simple curso.',
          contents: (
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
        });
        break;
      case 'LESS':
        content = {};
        break;
    }
  }, [type]);

  return (
    <div>
      <video src={content.videoURL} />
      <p>{content.title}</p>
      <p>{content.summary}</p>
      <p>Contenidos</p>
      {content.contents}
      <Separator.Root decorative={true} />
      <Separator.Root decorative={true} />
      <p>FAQ</p>
      <Accordion.Root type="multiple"></Accordion.Root>
      <button>Pagar</button>
    </div>
  );
};

export default DetalleCurso;
