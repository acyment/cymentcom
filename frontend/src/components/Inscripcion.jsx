import React, { useState, useEffect } from 'react';
import { Dialog } from '@ark-ui/react';
import { Cross2Icon } from '@radix-ui/react-icons';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Wizard } from 'react-formik-step-wizard';
import StepParticipantes from './StepParticipantes';
import StepFacturacion from './StepFacturacion';
import StepPago from './StepPago';
import * as Yup from 'yup';

export const AppContext = React.createContext({});

const Inscripcion = ({ idCurso }) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [mostrarMercadoPago, setMostrarMercadoPago] = useState(false);
  const [mostrarStripe, setMostrarStripe] = useState(false);
  const [disablePayButton, setDisablePayButton] = useState(false);
  const [country, setCountry] = useState('');

  // Track funnel start
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'funnel_start', {
        event_category: 'Funnel',
        event_label: 'Course Registration',
      });
    }
  }, []);

  const trackFunnelStep = (step) => {
    if (window.gtag) {
      window.gtag('event', `funnel_${step.toLowerCase()}`, {
        event_category: 'Funnel',
        event_label: 'Course Registration',
      });
    }
  };

  const countryWasSelected = (selectedCountry) => {
    setCountry(selectedCountry);
    if (selectedCountry === 'AR') {
      setMostrarMercadoPago(true);
      setMostrarStripe(false);
      if (window.gtag) {
        window.gtag('event', 'payment_method_selected', {
          event_category: 'Payment',
          event_label: 'MercadoPago',
        });
      }
    } else {
      setMostrarMercadoPago(false);
      setMostrarStripe(true);
      if (window.gtag) {
        window.gtag('event', 'payment_method_selected', {
          event_category: 'Payment',
          event_label: 'Stripe',
        });
      }
    }
    handleInputChange();
  };

  const steps = [
    {
      id: 'StepParticipantes',
      component: <StepParticipantes />,
      validationSchema: Yup.object({
        nombre: Yup.string().required('No te olvides del nombre'),
        apellido: Yup.string().required('No te olvides del apellido'),
        email: Yup.string().required('No te olvides del e-mail'),
      }),
      hidePrevious: true,
      onSubmit: () => trackFunnelStep('Participant Info'),
    },
    {
      id: 'StepFacturacion',
      component: <StepFacturacion idCurso={idCurso} />,
      validationSchema: Yup.object({
        pais: Yup.string().required('No te olvides del país'),
        nombreCompleto: Yup.string().required('No te olvides del nombre'),
        identificacionFiscal: Yup.string().when('pais', {
          is: 'AR',
          then: Yup.string().required('No te olvides del CUIT'),
          otherwise: Yup.string(),
        }),
      }),
      onSubmit: () => trackFunnelStep('Billing Info'),
    },
    {
      id: 'StepPago',
      component: <StepPago idCurso={idCurso} />,
      onSubmit: () => trackFunnelStep('Payment'),
    },
  ];

  return (
    <ScrollArea.Root>
      <ScrollArea.Viewport>
        <div className="ContenedorModal">
          <div>
            <Dialog.Title className="DialogTitle">Inscripción</Dialog.Title>
            <Wizard steps={steps} />
          </div>
        </div>
        <Dialog.CloseTrigger asChild>
          <button className="IconButton" aria-label="Close">
            <Cross2Icon />
          </button>
        </Dialog.CloseTrigger>
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
