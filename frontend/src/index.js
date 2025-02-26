import React from 'react';
import { createRoot } from 'react-dom/client';
import 'react-tooltip/dist/react-tooltip.css';
import posthog from 'posthog-js';
import App from './components/App.jsx';

// Initialize PostHog
if (process.env.POSTHOG_API_KEY) {
  posthog.init(process.env.POSTHOG_API_KEY, {
    api_host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false // We'll handle pageviews manually
  });
}

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);
