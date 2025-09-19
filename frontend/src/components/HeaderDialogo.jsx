import React from 'react';
import FormStepper from './FormStepper';

const HeaderDialogo = ({ stepNumber, onClose }) => {
  const stepLabels = ['Participante', 'Facturación', 'Pago', 'Resultado'];
  return (
    <div className="HeaderModal">
      <FormStepper activeStep={stepNumber} labels={stepLabels} />
      {onClose && (
        <button
          className="close-button"
          aria-label="Close"
          tabIndex={-1}
          type="button"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default HeaderDialogo;
