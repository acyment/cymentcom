import React, { Fragment, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import axios from 'axios';
import CountryDropdown from './CountryDropDown';
import DisableableWallet from './DisableableWallet';

const Inscripcion = () => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [mostrarMercadoPago, setMostrarMercadoPago] = useState(false);
  const [mostrarStripe, setMostrarStripe] = useState(false);
  const [disablePayButton, setDisablePayButton] = useState(false);

  useEffect(() => {
    const fetchPreferenceId = async () => {
      try {
        const response = await axios.post('/api/create-mp-preference/', {
          // Your payload here. Adjust according to what your endpoint expects.
        });
        const { preference_id } = response.data;
        setPreferenceId(preference_id);
      } catch (error) {
        console.error('Error fetching preference ID:', error);
        // Handle error appropriately
      }
    };

    fetchPreferenceId();
  }, []); // Empty dependency array means this effect runs once on mount

  const mercadopago = initMercadoPago(
    'TEST-196caf2e-4115-42ea-b5be-91e57bdd9084',
    { locale: 'es-AR' },
  );
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
    var form = document.getElementById('formulario-inscripcion'); // Change 'yourFormId' to the actual ID of your form

    setDisablePayButton(!form.checkValidity());
  };

  return (
    <form id="formulario-inscripcion">
      <div className="ContenedorModal">
        <div>
          <Dialog.Title className="DialogTitle">
            Formulario de inscripción
          </Dialog.Title>
          <Dialog.Description className="DialogDescription"></Dialog.Description>
          <h2>Datos de facturación</h2>
          <fieldset className="Fieldset">
            <CountryDropdown className="Input" onSelect={countryWasSelected} />
            <input
              className="Input"
              id="NombreCompleto"
              type="text"
              required
              placeholder="Nombre completo*"
              onBlur={handleInputChange}
            />
            <input
              className="Input"
              id="IdentificadorFiscal"
              placeholder="Identificador fiscal o documento"
            />
            <input className="Input" id="Direccion" placeholder="Dirección" />
            <input className="Input" id="Teléfono" placeholder="Teléfono" />
          </fieldset>
          <hr className="SeparadorModal" />
          <h2>Datos del participante</h2>
          <fieldset className="Fieldset">
            <input
              className="Input"
              type="text"
              required
              id="Nombre"
              placeholder="Nombre*"
              onBlur={handleInputChange}
            />
            <input
              className="Input"
              type="text"
              required
              id="Apellido"
              placeholder="Apellido*"
              onBlur={handleInputChange}
            />
            <input
              className="Input"
              type="email"
              required
              id="Email"
              placeholder="E-mail*"
              onBlur={handleInputChange}
            />
            <input
              className="Input"
              id="Organizacion"
              placeholder="Organización"
            />
            <input className="Input" id="Rol" placeholder="Rol" />
          </fieldset>
        </div>
        <img src="static/images/firulete-triple.svg"></img>
      </div>

      <Dialog.Close asChild>
        <Fragment>
          {preferenceId && mostrarStripe && (
            <button
              className="BotonPagarConStripe"
              formAction="/api/create-stripe-checkoutsession"
              formMethod="post"
              disabled={disablePayButton}
            >
              Pagar con Stripe
            </button>
          )}
          {preferenceId && mostrarMercadoPago && (
            <DisableableWallet
              preferenceId={preferenceId}
              disableWallet={disablePayButton}
            />
          )}
        </Fragment>
      </Dialog.Close>

      <Dialog.Close asChild>
        <button className="IconButton" aria-label="Close">
          <Cross2Icon />
        </button>
      </Dialog.Close>
    </form>
  );
};

export default Inscripcion;
