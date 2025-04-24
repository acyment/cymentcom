import React, { Fragment } from 'react';
import { usePostHog } from 'posthog-js/react';
import { Field, useFormikContext } from 'formik'; // Import useFormikContext
import CustomErrorMessage from './CustomErrorMessage';
import { ArrowRight } from 'lucide-react';

const StepParticipantes = ({ idCurso }) => {
  const posthog = usePostHog();
  const { submitForm, setTouched, isSubmitting, isValid, errors } =
    useFormikContext(); // Access Formik context

  // Function to handle submit and show errors
  const handleSubmit = async () => {
    // Touch all fields to display errors
    setTouched({
      nombre: true,
      apellido: true,
      email: true,
      organizacion: true,
      rol: true,
    });

    // Track analytics
    posthog?.capture('next_to_billing');

    // Submit the form (this will check validation)
    await submitForm();
  };

  return (
    <Fragment>
      <h3 className="form-title">Datos del participante</h3>

      <div className="form-row">
        <div className="form-element">
          <label htmlFor="nombre">Nombre*</label>
          <div className="input-container">
            <Field
              id="nombre"
              name="nombre"
              type="text"
              className="form-control"
              autoFocus={true}
            />
            <CustomErrorMessage name="nombre" />
          </div>
        </div>

        <div className="form-element">
          <label htmlFor="apellido">Apellido*</label>
          <div className="input-container">
            <Field
              id="apellido"
              name="apellido"
              type="text"
              className="form-control"
            />
            <CustomErrorMessage name="apellido" />
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-element full-width">
          <label htmlFor="email">E-mail*</label>
          <div className="input-container">
            <Field
              id="email"
              name="email"
              type="email"
              className="form-control"
            />
            <CustomErrorMessage name="email" />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-element">
          <label htmlFor="organizacion">Organización</label>
          <Field
            id="organizacion"
            name="organizacion"
            type="text"
            className="form-control"
          />
        </div>

        <div className="form-element">
          <label htmlFor="rol">Rol</label>
          <Field id="rol" name="rol" type="text" className="form-control" />
        </div>
      </div>

      <div className="form-row hidden">
        <div className="form-element">
          <label>Hidden</label>
          <span className="form-control" />
        </div>
      </div>
      <button
        className="BotonFormulario UnicoBotonSiguiente BotonContinuar"
        type="button" // Changed from "submit" to "button"
        disabled={!isValid || isSubmitting}
        onClick={handleSubmit} // Use our custom handler
      >
        Continuar
        <ArrowRight />
      </button>
    </Fragment>
  );
};

export default StepParticipantes;
