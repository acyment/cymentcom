import React from 'react';
import { render, screen } from '@/tests/utils';
import userEvent from '@testing-library/user-event';
import {
  Router,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router';
import { routeTree } from '@/routes/routes';

function renderAt(url) {
  const history = createMemoryHistory({ initialEntries: [url] });
  const router = new Router({ routeTree, history });
  const ui = <RouterProvider router={router} />;
  return { router, history, ui };
}

describe('ResultadoPago route', () => {
  it('renders success state when status=approved', async () => {
    const url =
      '/payment-result?status=approved&nombre_participante=Ana&nombre_curso=Curso&fecha_curso=2025-01-01&monto=USD%2099.99&email_facturacion=ana@example.com';
    const { ui } = renderAt(url);
    render(ui);

    // Title and message
    await screen.findByText('¡Pago Exitoso!');
    expect(screen.getByText(/Felicitaciones, Ana!/)).toBeInTheDocument();
    expect(screen.getByText(/Resumen de la transacción/)).toBeInTheDocument();
    expect(screen.getByText(/Factura:/)).toBeInTheDocument();
    // Button
    expect(screen.getByRole('button', { name: '¡Listo!' })).toBeInTheDocument();
  });

  it('renders failure state when status=failed', async () => {
    const url =
      '/payment-result?status=failed&nombre_participante=Ana&nombre_curso=Curso&fecha_curso=2025-01-01&monto=USD%2099.99';
    const { ui } = renderAt(url);
    render(ui);

    await screen.findByText('Error en el Pago');
    expect(screen.getByText(/Lo sentimos, Ana/)).toBeInTheDocument();
    expect(screen.getByText(/Detalles del intento/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reintentar más tarde' }),
    ).toBeInTheDocument();
  });

  it('accepts collection_status as status alias', async () => {
    // validateSearch maps collection_status -> status
    const url =
      '/payment-result?collection_status=approved&nombre_participante=Ana';
    const { ui } = renderAt(url);
    render(ui);

    await screen.findByText('¡Pago Exitoso!');
  });

  it('closes dialog and navigates home on dialog close', async () => {
    const url = '/payment-result?status=approved&nombre_participante=Ana';
    const { ui, router } = renderAt(url);
    render(ui);

    const closeBtn = await screen.findByRole('button', { name: '¡Listo!' });
    // Clicking the Radix Dialog.Close button triggers navigation to '/'
    await userEvent.click(closeBtn);

    // Router should navigate back to root path
    expect(router.state.location.pathname).toBe('/');
  });
});
