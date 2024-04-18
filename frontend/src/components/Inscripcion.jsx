import React, { Fragment, useState } from 'react';
import { Dialog, Portal } from '@ark-ui/react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import axios from 'axios';

import * as ScrollArea from '@radix-ui/react-scroll-area';

import DisableableWallet from './DisableableWallet';
import { Wizard, useWizard, BasicFooter } from 'react-formik-step-wizard';

import StepParticipantes from './StepParticipantes';
import StepFacturacion from './StepFacturacion';
import StepPago from './StepPago';
import * as Yup from 'yup';

export const AppContext = React.createContext({});

const Inscripcion = () => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [mostrarMercadoPago, setMostrarMercadoPago] = useState(false);
  const [mostrarStripe, setMostrarStripe] = useState(false);
  const [disablePayButton, setDisablePayButton] = useState(false);

  const [country, setCountry] = useState('');

  const countryWasSelected = (selectedCountry) => {
    setCountry(selectedCountry);
    if (selectedCountry === 'AR') {
      setMostrarMercadoPago(true);
      setMostrarStripe(false);
    } else {
      setMostrarMercadoPago(false);
      setMostrarStripe(true);
    }
    handleInputChange();
  };

  const handleInputChange = (event) => {
    setDisablePayButton(!areAllRequiredFieldsFilled());
  };

  const validationSchema = Yup.object().shape({
    emailParticipante: Yup.string()
      .email('Invalid email')
      .required('The email field is required'),
  });

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
    },
    {
      id: 'StepFacturacion',
      component: <StepFacturacion />,
      validationSchema: Yup.object({
        pais: Yup.string().required('No te olvides del país'),
        nombreCompleto: Yup.string().required('No te olvides del nombre'),
        identificadorFiscal: Yup.string().when('pais', {
          is: 'AR',
          then: Yup.string().required('No te olvides del CUIT'),
          otherwise: Yup.string(),
        }),
      }),
      onSubmit: async (stepValues, allValues, actions) => {
        console.log('Por hacer submit');
        return stepValues;
      },
    },
    {
      id: 'StepPago',
      component: <StepPago />,
    },
  ];

  return (
    <Fragment>
      <div className="ContenedorModal">
        <div>
          <Dialog.Title className="DialogTitle">Inscripción</Dialog.Title>

          <Wizard steps={steps} />
        </div>
        <img src="static/images/firulete-triple.svg"></img>
      </div>

      <Dialog.CloseTrigger asChild>
        <button className="IconButton" aria-label="Close">
          <Cross2Icon />
        </button>
      </Dialog.CloseTrigger>
    </Fragment>
  );
};

export default Inscripcion;
