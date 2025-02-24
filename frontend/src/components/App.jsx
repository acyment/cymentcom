import React, { useEffect } from 'react';
import Logo from './Logo';
import NavMenu from './NavMenu';
import Sections from './Sections';
import useFontFaceObserver from 'use-font-face-observer';
import 'normalize.css';
import '../../public/css/styles.scss';
import Contacto from './Contacto';
import ResultadoPago from './ResultadoPago';
import ReactGA from 'react-ga4';

function App() {
  const isFontListLoaded = useFontFaceObserver([
    {
      family: `Rubik`,
    },
  ]);

  // Initialize GA
  useEffect(() => {
    if (process.env.GA_MEASUREMENT_ID) {
      ReactGA.initialize(process.env.GA_MEASUREMENT_ID);
    }
  }, []);

  return (
    <div>
      <header className="header">
        <Logo />
        <NavMenu className="nav-menu" />
      </header>
      <main>
        <Sections />
      </main>
      <footer>
        <Contacto />
      </footer>
      <ResultadoPago />
    </div>
  );
}

export default App;
