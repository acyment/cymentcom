import React from 'react';
import { render, screen } from '@/tests/utils';
import {
  Router,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router';
import { routeTree } from '@/routes/routes';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// NOTE: These are characterization-style integration tests demonstrating MSW usage
// for when ResultadoPago starts fetching details by ID. They are skipped until
// the component implements that behavior.

const handlers = [
  rest.get('/api/payment-results/:provider', (req, res, ctx) => {
    const { provider } = req.params;
    const paymentId = req.url.searchParams.get('payment_id');
    if (!paymentId) {
      return res(ctx.status(400), ctx.json({ error: 'missing payment_id' }));
    }
    return res(
      ctx.status(200),
      ctx.json({
        provider,
        id: paymentId,
        status: 'approved',
        amount: 'USD 99.99',
      }),
    );
  }),
];

const server = setupServer(...handlers);

function renderAt(url) {
  const history = createMemoryHistory({ initialEntries: [url] });
  const router = new Router({ routeTree, history });
  const ui = <RouterProvider router={router} />;
  return { router, history, ui };
}

describe.skip('ResultadoPago + MSW integration (pending fetch implementation)', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('fetches and renders details based on payment_id and provider', async () => {
    // Imagine ResultadoPago reads provider/payment_id and fetches
    const url =
      '/payment-result?status=approved&provider=stripe&payment_id=pi_123';
    const { ui } = renderAt(url);
    render(ui);

    // Base UI from query params
    await screen.findByText('¡Pago Exitoso!');

    // And once the fetch resolves, details appear (example assertion)
    // e.g., expect details returned by the API to be displayed
    // await screen.findByText('USD 99.99')
  });

  it('shows an error state when API fails', async () => {
    server.use(
      rest.get('/api/payment-results/:provider', (_req, res, ctx) =>
        res(ctx.status(500), ctx.json({ error: 'server error' })),
      ),
    );

    const url =
      '/payment-result?status=approved&provider=mp&payment_id=pay_123';
    const { ui } = renderAt(url);
    render(ui);

    // Base UI shows success
    await screen.findByText('¡Pago Exitoso!');

    // When component handles API errors, assert the error UI here
    // await screen.findByText(/No pudimos recuperar los detalles del pago/i)
  });
});
