import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import FormStepper from './FormStepper';

const HeaderDialogo = ({ stepNumber }) => {
  const stepLabels = ['Participante', 'Facturación', 'Pago', 'Resultado'];
  return (
    <div className="HeaderModal">
      <FormStepper activeStep={stepNumber} labels={stepLabels} />
      <Dialog.Close asChild>
        <button className="close-button" aria-label="Close" tabIndex={-1}>
          ×
        </button>
      </Dialog.Close>
    </div>
  );
};

export default HeaderDialogo;
