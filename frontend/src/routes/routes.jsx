import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './root';
import Sections from '../components/Sections';
import ResultadoPago from '../components/ResultadoPago';

// Index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Sections
});

// Payment result route
const paymentResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'payment-result',
  component: ResultadoPago,
  validateSearch: (search) => ({
    status: search.status,
    payment_id: search.payment_id
  })
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  paymentResultRoute
]);
