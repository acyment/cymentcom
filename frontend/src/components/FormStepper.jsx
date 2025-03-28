import React from 'react';

const FormStepper = ({
  activeStep,
  labels = ['Participante', 'Facturación', 'Pago', 'Resultado'],
}) => {
  // Derivar el número de pasos de la longitud de labels
  const stepsCount = labels.length;

  return (
    <div className="progress-indicator">
      {labels.map((label, index) => (
        <React.Fragment key={index}>
          <div
            className={`step ${index + 1 <= activeStep ? 'active' : ''} ${
              index + 1 < activeStep ? 'completed' : ''
            }`}
            aria-current={index + 1 === activeStep ? 'step' : null}
          >
            {index + 1 < activeStep ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            ) : (
              index + 1
            )}
            <span className="step-label">{label}</span>
          </div>
          {index < stepsCount - 1 && (
            <div
              className={`step-line ${index + 1 < activeStep ? 'active' : ''}`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FormStepper;
