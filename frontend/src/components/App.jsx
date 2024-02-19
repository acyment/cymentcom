import React from 'react';
import Logo from './Logo';
import NavMenu from './NavMenu';
import Sections from './Sections';
import useFontFaceObserver from 'use-font-face-observer';
import 'normalize.css';
import '../../public/css/styles.css';
import * as Toggle from '@radix-ui/react-toggle';

function App() {
  const isFontListLoaded = useFontFaceObserver([
    {
      family: `Rubik`,
    },
  ]);

  return (
    <div>
      <header className="header">
        <Logo className="logo" />
        <NavMenu className="nav-menu" />
      </header>
      <main>
        <Sections />
      </main>
      <footer>
        <div>Contactos</div>
      </footer>
    </div>
  );
}

export default App;
