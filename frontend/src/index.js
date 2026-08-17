import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routes/routes';
import { createRouter } from '@tanstack/react-router';
import { PostHogProvider } from 'posthog-js/react';
import 'react-tooltip/dist/react-tooltip.css';

const router = createRouter({ routeTree });

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={process.env.POSTHOG_API_KEY}
      options={{ api_host: process.env.POSTHOG_HOST, autocapture: false }}
    >
      <RouterProvider router={router} />
    </PostHogProvider>
  </React.StrictMode>,
);
