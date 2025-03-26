import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './root';
import Sections from '../components/Sections';
import ResultadoPago from '../components/ResultadoPago';

// Index route with nested payment result
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Sections,
});

const paymentResultRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: 'payment-result',
  component: ResultadoPago,
  validateSearch: (search) => ({
    status: search.status || search.collection_status,
    payment_id: search.payment_id || search.collection_id
  })
});

export const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([paymentResultRoute])
]);
