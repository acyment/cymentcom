import React from 'react';
import { createRoot } from 'react-dom/client';
import 'react-tooltip/dist/react-tooltip.css';
import { PostHogProvider } from 'posthog-js/react';
import App from './components/App.jsx';

const container = document.getElementById('app');
const root = createRoot(container);

const posthog_options = {
  api_host: process.env.POSTHOG_HOST,
  autocapture: false,
};

root.render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={process.env.POSTHOG_API_KEY}
      options={posthog_options}
    >
      <App />
    </PostHogProvider>
  </React.StrictMode>,
);
