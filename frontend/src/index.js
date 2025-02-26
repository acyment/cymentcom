import React from 'react';
import { createRoot } from 'react-dom/client';
import 'react-tooltip/dist/react-tooltip.css';

import App from './components/App.jsx';

// Initialize Google Analytics
if (process.env.GA_MEASUREMENT_ID) {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', process.env.GA_MEASUREMENT_ID);
}

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);
