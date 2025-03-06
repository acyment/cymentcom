import React, { Fragment } from 'react';
import { usePostHog } from 'posthog-js/react';
import { Field, useFormikContext } from 'formik'; // Import useFormikContext
import CustomErrorMessage from './CustomErrorMessage';

const StepParticipantes = () => {
  const posthog = usePostHog();
  const { submitForm, setTouched, isSubmitting, errors } = useFormikContext(); // Access Formik context

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
      <div className="form-container">
        <h3 className="form-title">Datos del participante</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre*</label>
            <Field
              id="nombre"
              name="nombre"
              type="text"
              className="form-control"
              placeholder="Tu nombre"
            />
            <CustomErrorMessage name="nombre" />
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido*</label>
            <Field
              id="apellido"
              name="apellido"
              type="text"
              className="form-control"
              placeholder="Tu apellido"
            />
            <CustomErrorMessage name="apellido" />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="email">E-mail*</label>
          <Field
            id="email"
            name="email"
            type="email"
            className="form-control"
            placeholder="tu@email.com"
          />
          <CustomErrorMessage name="email" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="organizacion">Organización</label>
            <Field
              id="organizacion"
              name="organizacion"
              type="text"
              className="form-control"
              placeholder="Nombre de tu empresa u organización"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rol">Rol</label>
            <Field
              id="rol"
              name="rol"
              type="text"
              className="form-control"
              placeholder="Tu posición o cargo"
            />
          </div>
        </div>

        <button
          className="BotonFormulario UnicoBotonSiguiente"
          type="button" // Changed from "submit" to "button"
          disabled={isSubmitting}
          onClick={handleSubmit} // Use our custom handler
        >
          Continuar
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 0L6.59 1.41L12.17 7H0V9H12.17L6.59 14.59L8 16L16 8L8 0Z"
              fill="white"
            />
          </svg>
        </button>
      </div>
    </Fragment>
  );
};

export default StepParticipantes;
