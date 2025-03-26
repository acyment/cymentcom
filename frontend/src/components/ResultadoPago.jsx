import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useSearch } from '@tanstack/react-router';

const ResultadoPago = () => {
  const { status } = useSearch({ strict: false });
  
  return (
    <Dialog.Root open={!!status}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          {status === 'approved' ? (
            <div>Pago aprobado</div>
          ) : (
            <div>Status is not approved.</div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ResultadoPago;
