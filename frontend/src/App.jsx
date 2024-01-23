import React, { Component } from 'react';
import { render } from 'react-dom';
// import one other component for simplicity
import Home from './Home';
// import other components if you need them

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Home />
      </div>
    );
  }
}

const appDiv = document.getElementById('app');
render(<App />, appDiv);
