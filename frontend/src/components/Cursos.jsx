import React, { useState, useRef, useEffect } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import DetalleCurso from './DetalleCurso';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import axios from 'axios';

const Cursos = () => {
  const [tiposCurso, setTiposCurso] = useState([]);

  const refDetalleCurso = useRef(null);
  const refListaCursos = useRef(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [triggerScroll, setTriggerScroll] = useState(false);
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace 'your_api_endpoint' with the actual endpoint URL
        const response = await axios.get('/api/tipos-de-curso');
        const dictTiposCurso = response.data.reduce((acc, obj) => {
          acc[obj.nombre_corto] = obj;
          return acc;
        }, {});
        setTiposCurso(dictTiposCurso);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  const updateSelectedItem = (value) => {
    setSelectedCourse(value); // Update selected item
    setTriggerScroll(true); // Set trigger to true to initiate scroll in useEffect
  };

  useEffect(() => {
    if (triggerScroll) {
      if (selectedCourse === '')
        refListaCursos.current.scrollIntoView({ behavior: 'smooth' });
      else if (refDetalleCurso.current)
        refDetalleCurso.current.scrollIntoView({ behavior: 'smooth' });
      setTriggerScroll(false); // Reset trigger after scroll
    }
  }, [selectedCourse, triggerScroll]); // Depend on selectedCourse and triggerScroll

  return (
    <div
      id="cursos"
      className="CursosAccordion NavigationBarScrollOffset"
      ref={refListaCursos}
    >
      <div className="CursosHeader">
        <ToggleGroup.Root
          ref={sliderRef}
          type="single"
          onValueChange={updateSelectedItem}
          className="ResumenCursosCarousel"
        >
          {Object.values(tiposCurso).map((tipoCurso) => (
            <ToggleGroup.Item
              className="ToggleResumenCurso"
              value={tipoCurso.nombre_corto}
            >
              <div className="ContenedorImagenResumenCurso">
                <img
                  src={
                    selectedCourse === tipoCurso.nombre_corto
                      ? `static/images/${tipoCurso.foto}`
                      : `static/images/${tipoCurso.foto_tint}`
                  }
                  className="ImagenResumenCurso"
                />
              </div>

              <div className="TextoResumenCurso">
                <h3 className="CursosTituloAcronimo">
                  {tipoCurso.nombre_corto}
                </h3>
                <h4 className="CursosTitulo">{tipoCurso.nombre_completo}</h4>
                <p className="CursosTituloBajada">
                  {tipoCurso.resumen_una_linea}
                </p>
              </div>
              <span className="CircleButton CircleButtonCursos" />
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>
      {selectedCourse && (
        <DetalleCurso
          ref={refDetalleCurso}
          tipoCurso={tiposCurso[selectedCourse]}
        />
      )}
    </div>
  );
};

export default Cursos;
