import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import App from '../components/App';
import { TanStackRouterDevtoolsInProd as TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: () => (
    <App>
      <Outlet /> {/* Renders child routes */}
      <TanStackRouterDevtools />
    </App>
  ),
});
