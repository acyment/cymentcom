import { createRootRoute, Outlet } from '@tanstack/react-router';
import App from '../components/App';

export const Route = createRootRoute({
  component: () => (
    <App>
      <Outlet /> {/* Renders child routes */}
    </App>
  )
});
