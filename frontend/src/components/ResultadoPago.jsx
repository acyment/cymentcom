import queryString from 'query-string';
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

const ResultadoPago = () => {
  const volviendoDeIntentarPago = () => {
    const queryStringParams = queryString.parse(window.location.search);
    return 'status' in queryStringParams;
  };

  const statusIntentoDePago = () => {
    return queryString.parse(window.location.search).status;
  };

  return (
    volviendoDeIntentarPago() && (
      <Dialog.Root defaultOpen={true}>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent">
            {statusIntentoDePago() === 'approved' ? (
              <div>Status is approved.</div>
            ) : (
              <div>Status is not approved.</div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  );
};

export default ResultadoPago;
