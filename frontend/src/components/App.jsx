import React from 'react';
import { useSnapCarousel } from 'react-snap-carousel';
import NavMenu from './NavMenu';
import Sections from './Sections';

class App extends React.Component {
  render() {
    return (
      <div>
        <NavMenu />
        <Sections />
        <div>Contacto</div>
      </div>
    );
  }
}

export default App;
