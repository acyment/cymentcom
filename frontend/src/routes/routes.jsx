import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './root';
import Sections from '../components/Sections';
import ResultadoPago from '../components/ResultadoPago';
import { CheckoutEntry } from '@/features/checkout/CheckoutEntry';
import CheckoutFlow from '@/features/checkout/CheckoutFlow';
import CourseDetail from '@/components/CourseDetail';

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
    payment_id: search.payment_id || search.collection_id,
  }),
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'checkout',
  component: () => (
    <CheckoutEntry title="Checkout">
      <CheckoutFlow />
    </CheckoutEntry>
  ),
});

const cursosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'cursos',
});

const cursoSlugRoute = createRoute({
  getParentRoute: () => cursosRoute,
  path: '$slug',
  component: CourseDetail,
});

export const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([paymentResultRoute]),
  checkoutRoute,
  cursosRoute.addChildren([cursoSlugRoute]),
]);
