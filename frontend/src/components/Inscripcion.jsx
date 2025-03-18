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

const Inscripcion = ({ idCurso, nombreCorto, costoUSD, costoARS }) => {
  const posthog = usePostHog();

  // Track funnel start
  useEffect(() => {
    posthog?.capture('funnel_start', { course_id: idCurso });
  }, [idCurso]);

  const trackFunnelStep = (step) => {
    posthog?.capture(step);
  };

  const steps = [
    {
      id: 'StepParticipantes',
      component: <StepParticipantes idCurso={idCurso} />,
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
      component: <StepFacturacion idCurso={idCurso} />,
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
      component: <StepPago />,
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

  function StepWrapper({ nombreCorto, costoUSD, costoARS }) {
    const { activeStep, values } = useWizard();
    const paisEsArgentina =
      values && values.StepFacturacion && values.StepFacturacion.pais
        ? values.StepFacturacion.pais === 'AR'
        : null;

    return (
      <div className="form-container">
        <div className="CursoInfo">
          <span>Curso elegido: {nombreCorto}</span>
          <div className="CostoCursoInfo">
            {paisEsArgentina === null ? (
              <>
                <span>Costo ARS: {costoARS}</span>
                <span>Costo USD: {costoUSD}</span>
              </>
            ) : paisEsArgentina ? (
              <span>Costo ARS: {costoARS}</span>
            ) : (
              <span>Costo USD: {costoUSD}</span>
            )}
          </div>
        </div>
        {activeStep.component}
      </div>
    );
  }

  return (
    <ScrollArea.Root>
      <ScrollArea.Viewport>
        <div className="ContenedorModal">
          <Wizard
            steps={steps}
            wrapper={
              <StepWrapper
                nombreCorto={nombreCorto}
                costoUSD={costoUSD}
                costoARS={costoARS}
              />
            }
            header={<Header />}
          />
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
