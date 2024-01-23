import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Dialog from '@radix-ui/react-dialog';
import { initMercadoPago } from '@mercadopago/sdk-react';

initMercadoPago('APP_USR-debfd4aa-4ee0-481f-b5d9-5afedae2a7af');
const Cursos = () => {
  const handlePayClick = () => {};

  return (
    <Accordion.Item value="Cursos">
      <Accordion.Trigger>Cursos</Accordion.Trigger>
      <Accordion.Content>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button>Pagar</button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content className="DialogContent">
              <Dialog.Title className="DialogTitle">Pagar!</Dialog.Title>
              <Dialog.Description className="DialogDescription">
                Ingresa tus datos
              </Dialog.Description>
              <fieldset className="Fieldset">
                <label className="Label" htmlFor="name">
                  Nombre
                </label>
                <input
                  className="Input"
                  id="name"
                  defaultValue="Pedro Duarte"
                />
              </fieldset>
              <fieldset className="Fieldset">
                <label className="Label" htmlFor="email">
                  Email
                </label>
                <input
                  className="Input"
                  id="email"
                  defaultValue="peduarte@gmail.com"
                />
              </fieldset>
              <div
                style={{
                  display: 'flex',
                  marginTop: 25,
                  justifyContent: 'flex-end',
                }}
              >
                <Dialog.Close asChild>
                  <button>Pagar con Mercado Pago</button>
                </Dialog.Close>
              </div>
              <Dialog.Close asChild>
                <button className="IconButton" aria-label="Close"></button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default Cursos;
