import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor, within } from '@/tests/utils';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import ResultadoPago from './ResultadoPago';
import * as RouterHooks from '@tanstack/react-router';

// NOTE: These are characterization-style integration tests demonstrating MSW usage
// for when ResultadoPago starts fetching details by ID. They are skipped until
// the component implements that behavior.

const handlers = [
  http.get('/api/payment-results/:provider', ({ request, params }) => {
    const url = new URL(request.url);
    const paymentId = url.searchParams.get('payment_id');
    if (!paymentId) {
      return HttpResponse.json(
        { error: 'missing payment_id' },
        { status: 400 },
      );
    }
    const { provider } = params;
    return HttpResponse.json(
      { provider, id: paymentId, status: 'approved', amount: 'USD 99.99' },
      { status: 200 },
    );
  }),
];

const server = setupServer(...handlers);

// Mock router hooks so we can render the component directly
vi.mock('@tanstack/react-router', () => ({
  useSearch: vi.fn(),
  useNavigate: vi.fn(() => vi.fn()),
}));

describe('ResultadoPago + MSW integration (fetch by id)', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('fetches and renders details based on payment_id and provider', async () => {
    RouterHooks.useSearch.mockReturnValue({
      status: 'approved',
      provider: 'stripe',
      payment_id: 'pi_123',
      nombre_participante: 'Ana',
      nombre_curso: 'Curso',
      fecha_curso: '2025-01-01',
      monto: 'USD 99.99',
    });
    render(<ResultadoPago />);
    // Base UI from query params
    await screen.findByText('¡Pago Exitoso!');
    const dialog = await screen.findByRole('dialog');
    // Amount from MSW response should be displayed (text split across nodes)
    await waitFor(() => {
      const matches = within(dialog).queryAllByText((_, node) =>
        node?.textContent?.includes('Importe confirmado: USD 99.99'),
      );
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it('does not show fetched amount when API fails', async () => {
    server.use(
      http.get('/api/payment-results/:provider', () =>
        HttpResponse.json({ error: 'server error' }, { status: 500 }),
      ),
    );

    RouterHooks.useSearch.mockReturnValue({
      status: 'approved',
      provider: 'mp',
      payment_id: 'pay_123',
      nombre_participante: 'Ana',
      nombre_curso: 'Curso',
      fecha_curso: '2025-01-01',
      monto: 'USD 99.99',
    });
    render(<ResultadoPago />);
    await screen.findByText('¡Pago Exitoso!');
    // No fetched amount should be shown on error
    await waitFor(() => {
      expect(
        screen.queryByText(/Importe confirmado:/i),
      ).not.toBeInTheDocument();
    });
  });
});
