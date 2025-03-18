import React, { useState, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { Dialog } from '@ark-ui/react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useWizard, Wizard } from 'react-formik-step-wizard';
import StepParticipantes from './StepParticipantes';
import StepFacturacion from './StepFacturacion';
import StepPago from './StepPago';
import * as Yup from 'yup';
import FormStepper from './FormStepper';

export const AppContext = React.createContext({});

const Inscripcion = ({ curso }) => {
  const posthog = usePostHog();

  // Track funnel start
  useEffect(() => {
    posthog?.capture('funnel_start', { course_id: curso.id });
  }, [curso]);

  const trackFunnelStep = (step) => {
    posthog?.capture(step);
  };

  const steps = [
    {
      id: 'StepParticipantes',
      component: <StepParticipantes curso={curso} />,
      validationSchema: Yup.object({
        nombre: Yup.string().required('No te olvides del nombre'),
        apellido: Yup.string().required('No te olvides del apellido'),
        email: Yup.string().required('No te olvides del e-mail'),
      }),
      hidePrevious: true,
      // onSubmit: () => trackFunnelStep('Participant Info'),
    },
    {
      id: 'StepFacturacion',
      component: <StepFacturacion curso={curso} />,
      validationSchema: Yup.object({
        pais: Yup.string().required('No te olvides del país'),
        nombreCompleto: Yup.string().required('No te olvides del nombre'),
        identificacionFiscal: Yup.string().when('pais', {
          is: (pais) => pais === 'AR',
          then: (schema) => schema.required('No te olvides del CUIT'),
        }),
      }),
      // onSubmit: () => trackFunnelStep('Billing Info'),
    },
    {
      id: 'StepPago',
      component: <StepPago curso={curso} />,
      // onSubmit: () => trackFunnelStep('Payment'),
    },
  ];

  function Header() {
    const { stepNumber } = useWizard();
    const stepLabels = ['Participante', 'Facturación', 'Pago'];
    return (
      <div className="HeaderModal">
        <FormStepper activeStep={stepNumber} labels={stepLabels} />
        <Dialog.CloseTrigger asChild>
          <button className="close-button" aria-label="Close" tabIndex={-1}>
            ×
          </button>
        </Dialog.CloseTrigger>
      </div>
    );
  }

  return (
    <ScrollArea.Root>
      <ScrollArea.Viewport>
        <div className="ContenedorModal">
          <Wizard steps={steps} header={<Header />} />
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="ScrollAreaScrollbar"
        orientation="vertical"
      >
        <ScrollArea.Thumb className="ScrollAreaThumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
};

export default Inscripcion;
