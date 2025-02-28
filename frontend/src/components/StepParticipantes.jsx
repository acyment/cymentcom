import React, { Fragment } from 'react';
import { usePostHog } from 'posthog-js/react';
import { Field, ErrorMessage } from 'formik';
import CustomErrorMessage from './CustomErrorMessage';

const StepParticipantes = () => {
  const posthog = usePostHog();
  return (
    <Fragment>
      <p className="TituloStep">Datos del participante</p>
      <div className="Fieldset">
        <Field
          name="nombre"
          placeholder="Nombre*"
          type="text"
          className="Input"
        />
        <CustomErrorMessage name="nombre" />
        <Field
          name="apellido"
          placeholder="Apellido*"
          type="text"
          className="Input"
        />
        <CustomErrorMessage name="apellido" />
        <Field
          name="email"
          placeholder="E-mail*"
          type="email"
          className="Input"
        />
        <CustomErrorMessage name="email" />
        <Field
          name="organizacion"
          placeholder="Organización"
          type="text"
          className="Input"
        />
        <Field name="rol" placeholder="Rol" type="text" className="Input" />
        <button 
          className="BotonFormulario UnicoBotonSiguiente" 
          type="submit"
          onClick={() => {
            posthog?.capture('next_to_billing');
          }}
        >
          Facturación
        </button>
      </div>
    </Fragment>
  );
};

export default StepParticipantes;
