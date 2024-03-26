import React, { useEffect, useRef, useState } from 'react';
import { Wallet } from '@mercadopago/sdk-react';

const DisableableWallet = ({ preferenceId, disableWallet }) => {
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    let observer;
    let intervalId;

    const checkAndDisableButton = () => {
      const walletButton = container.querySelector('button');
      const imgElement = container.querySelector('image');
      if (walletButton && imgElement) {
        walletButton.disabled = disableWallet;
        walletButton.style.cssText = disableWallet
          ? 'background-color: gray !important;'
          : '';
        walletButton.style.cursor = disableWallet ? 'not-allowed' : 'pointer';
        // Once the button is found and disabled, no need to keep looking for it
        observer && observer.disconnect();
        clearInterval(intervalId);

        imgElement.style.filter = disableWallet ? 'grayscale(100%)' : '';

        const allElements = container.querySelectorAll('*');
        allElements.forEach((element) => {});
      }
    };

    if (container) {
      // MutationObserver setup
      observer = new MutationObserver(checkAndDisableButton);
      observer.observe(container, {
        childList: true,
        subtree: true,
      });

      // Fallback interval check
      intervalId = setInterval(checkAndDisableButton, 500); // Check every 500ms
    }

    return () => {
      // Cleanup
      observer && observer.disconnect();
      clearInterval(intervalId);
    };
  }, [disableWallet]);

  return (
    <div ref={containerRef}>
      <Wallet
        initialization={{ preferenceId: preferenceId }}
        customization={{
          visual: {
            buttonBackground: 'blue',
            borderRadius: '9px',
            hideValueProp: true,
          },
        }}
      />
    </div>
  );
};

export default DisableableWallet;
