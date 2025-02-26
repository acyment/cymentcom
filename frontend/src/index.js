import React from 'react';
import { createRoot } from 'react-dom/client';
import 'react-tooltip/dist/react-tooltip.css';
import Tracker from '@openreplay/tracker';

import App from './components/App.jsx';

// Initialize OpenReplay
if (process.env.OPENREPLAY_PROJECT_KEY) {
  const tracker = new Tracker({
    projectKey: process.env.OPENREPLAY_PROJECT_KEY,
  });
  tracker.start();
}

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);
