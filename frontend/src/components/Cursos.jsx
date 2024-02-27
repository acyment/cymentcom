import React, { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import DetalleCurso from './DetalleCurso';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';

const Cursos = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      slideChanged() {},
      slides: {
        perView: 3,
      },
    },
    [
      // add plugins here
    ],
  );

  // Function to handle item selection
  const updateSelectedItem = (value) => {
    setSelectedCourse(value); // Update selected item
  };

  return (
    <div className="CursosAccordion">
      <div className="CursosHeader">
        <ToggleGroup.Root
          ref={sliderRef}
          type="single"
          onValueChange={updateSelectedItem}
          className=" ResumenCursosCarousel"
        >
          <ToggleGroup.Item className=" ToggleResumenCurso" value="CSM">
            <img
              src="static/images/resumen-CSM-colored.jpg"
              className="ImagenResumenCurso"
            />
            <div className="TextoResumenCurso">
              <h3 className="CursosTituloAcronimo">CSM</h3>
              <h4 className="CursosTitulo">Certified ScrumMaster</h4>
              <p className="CursosTituloBajada">
                Introducción a la agilidad más profunda
              </p>
            </div>
            <span className="CircleButton CircleButtonCursos" />
          </ToggleGroup.Item>
          <ToggleGroup.Item className="ToggleResumenCurso" value="CSPO">
            <img
              src="static/images/resumen-CSM-colored.jpg"
              className="ImagenResumenCurso"
            />
            <div className="TextoResumenCurso">
              <h3 className="CursosTituloAcronimo">CSPO</h3>
              <h4 className="CursosTitulo">Certified Scrum Product Owner</h4>
              <p className="CursosTituloBajada">
                Introducción a la agilidad más profunda
              </p>
            </div>
            <span className="CircleButton CircleButtonCursos" />
          </ToggleGroup.Item>
          <ToggleGroup.Item className=" ToggleResumenCurso" value="LeSS">
            <img
              src="static/images/resumen-CSM-colored.jpg"
              className="ImagenResumenCurso"
            />
            <div className="TextoResumenCurso">
              <h3 className="CursosTituloAcronimo">LeSS</h3>
              <h4 className="CursosTitulo">Intro a LeSS</h4>
              <p className="CursosTituloBajada">
                Introducción a la agilidad más profunda
              </p>
            </div>
            <span className="CircleButton CircleButtonCursos" />
          </ToggleGroup.Item>
        </ToggleGroup.Root>
        {selectedCourse && <DetalleCurso type={selectedCourse} />}
      </div>
    </div>
  );
};

export default Cursos;
