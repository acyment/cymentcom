import React, { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import useFontFaceObserver from 'use-font-face-observer';
import 'normalize.css';
import '@radix-ui/colors/black-alpha.css';
import '@radix-ui/colors/green.css';
import '@radix-ui/colors/mauve.css';
import '@radix-ui/colors/violet.css';
import '../../public/css/styles.scss';
import Logo from './Logo';
import NavMenu from './NavMenu';
import Contacto from './Contacto';
import { useIsMobile } from '@/hooks/useIsMobile';
import { BP_MD } from '@/styles/breakpoints';

function App({ children }) {
  useFontFaceObserver([{ family: 'Rubik' }]);

  const location = useLocation();
  const isMobile = useIsMobile(`(max-width: ${BP_MD}px)`);
  const isFullscreenCheckout =
    isMobile && location?.pathname?.startsWith('/checkout');

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const previousPadding = document.body.style.paddingTop;
    if (isFullscreenCheckout) {
      document.body.style.paddingTop = '0px';
    } else {
      document.body.style.paddingTop = '';
    }
    return () => {
      document.body.style.paddingTop = previousPadding;
    };
  }, [isFullscreenCheckout]);

  return (
    <div className={isFullscreenCheckout ? 'App App--fullscreen' : 'App'}>
      {!isFullscreenCheckout && (
        <header className="header">
          <Logo />
          <NavMenu className="nav-menu" />
        </header>
      )}
      <main
        className={
          isFullscreenCheckout ? 'App__main App__main--fullscreen' : 'App__main'
        }
      >
        {children}
      </main>
      {!isFullscreenCheckout && (
        <footer className="App__footer">
          <Contacto />
        </footer>
      )}
    </div>
  );
}

export default App;
