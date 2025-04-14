import React from 'react';
import Logo from './Logo';
import NavMenu from './NavMenu';
import useFontFaceObserver from 'use-font-face-observer';
import 'normalize.css';
import '../../public/css/styles.scss';
import Contacto from './Contacto';
import { Link } from '@tanstack/react-router';

function App({ children }) {
  const isFontListLoaded = useFontFaceObserver([{ family: 'Rubik' }]);

  return (
    <div>
      <header className="header">
        <Logo />
        <NavMenu className="nav-menu" />
      </header>
      <main>{children}</main>
      <footer>
        <Contacto />
      </footer>
    </div>
  );
}

export default App;
