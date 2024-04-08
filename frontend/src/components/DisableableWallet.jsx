import React, { useMemo } from 'react';
import { Wallet } from '@mercadopago/sdk-react';

const DisableableWallet = React.memo(({ preferenceId, disableWallet }) => {
  // Memoize the initialization and customization objects to ensure they don't cause re-renders
  const walletProps = useMemo(
    () => ({
      initialization: { preferenceId },
      customization: {
        visual: {
          buttonBackground: 'blue',
          borderRadius: '9px',
          hideValueProp: true,
        },
      },
      callbacks: {
        onError: (error) => {
          // activado cuando ocurre un error
          console.log(error);
        },
        onReady: () => {
          // activado cuando el Brick está listo
        },
        onSubmit: () => {
          // activado cuando se hace clic en el botón
        },
      },
    }),

    [preferenceId],
  ); // dependency array ensures this only recalculates if preferenceId changes

  // Style for the overlay
  const overlayStyle = useMemo(
    () => ({
      position: 'absolute',
      top: '16px',
      left: 0,
      right: 0,
      bottom: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'grayscale(100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#000',
      fontSize: '20px',
      zIndex: 1000,
      borderRadius: '8px',
      cursor: 'not-allowed',
    }),
    [],
  ); // No dependencies, only calculates once

  // Style for the container
  const containerStyle = useMemo(
    () => ({
      position: 'relative',
    }),
    [],
  ); // No dependencies, only calculates once

  return (
    <div className="siome" style={containerStyle}>
      <Wallet {...walletProps} />
      {disableWallet && <div className="chicho" style={overlayStyle}></div>}
    </div>
  );
});

export default DisableableWallet;
