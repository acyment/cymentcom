import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from '@tanstack/react-router';

import CheckoutFlow from '../CheckoutFlow';

vi.mock('@/components/Inscripcion', () => ({
  __esModule: true,
  default: ({ idCurso, nombreCorto }) => (
    <div data-testid="inscripcion" data-course-id={idCurso}>
      {nombreCorto}
    </div>
  ),
}));

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'checkout',
  component: CheckoutFlow,
});

const routeTree = rootRoute.addChildren([checkoutRoute]);

describe('CheckoutFlow', () => {
  it('requires course search params when visiting the checkout route', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: [
          '/checkout?idCurso=test&nombreCorto=Test%20Course&costoUSD=123',
        ],
      }),
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByTestId('inscripcion')).toHaveAttribute(
      'data-course-id',
      'test',
    );
  });
});
