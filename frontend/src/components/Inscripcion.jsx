import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import axios from 'axios';

const Inscripcion = () => {
  const [preferenceId, setPreferenceId] = useState(null);

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
  );
  const [value, setValue] = useState('');
  const countryOptions = useMemo(() => countryList().getData(), []);

  const changeHandler = (value) => {
    setValue(value);
  };

  const customStyles = {
    placeholder: (provided) => ({
      ...provided,
      color: '#cccccc', // Change placeholder text color
    }),
  };

  return (
    <form>
      <div className="ContenedorModal">
        <div>
          <Dialog.Title className="DialogTitle">
            Formulario de inscripción
          </Dialog.Title>
          <Dialog.Description className="DialogDescription"></Dialog.Description>
          <h2>Datos de facturación</h2>
          <fieldset className="Fieldset">
            <Select
              options={countryOptions}
              value={value}
              onChange={changeHandler}
              placeholder="País"
              styles={customStyles}
              className="ContenedorCombobox"
              classNamePrefix="Combobox"
            ></Select>
            <input
              className="Input"
              id="NombreCompleto"
              type="text"
              required
              placeholder="Nombre completo*"
            />
            <input
              className="Input"
              id="IdentificadorFiscal"
              placeholder="Identificador fiscal o documento*"
            />
            <input className="Input" id="Direccion" placeholder="Dirección" />
            <input className="Input" id="Teléfono" placeholder="Teléfono" />
          </fieldset>
          <Wallet initialization={{ preferenceId: preferenceId }} />

          <hr className="SeparadorModal" />
          <h2>Datos del participante</h2>
          <fieldset className="Fieldset">
            <input
              className="Input"
              type="text"
              required
              id="Nombre"
              placeholder="Nombre*"
            />
            <input
              className="Input"
              type="text"
              required
              id="Apellido"
              placeholder="Apellido*"
            />
            <input
              className="Input"
              type="email"
              required
              id="Email"
              placeholder="E-mail*"
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
      <div
        style={{
          display: 'flex',
          marginTop: 25,
          justifyContent: 'flex-end',
        }}
      >
        <Dialog.Close asChild>
          <button className="Button green">Pagar</button>
        </Dialog.Close>
      </div>
      <Dialog.Close asChild>
        <button className="IconButton" aria-label="Close">
          <Cross2Icon />
        </button>
      </Dialog.Close>
    </form>
  );
};

export default Inscripcion;
