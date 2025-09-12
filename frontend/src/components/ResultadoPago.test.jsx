import React from 'react';
import { vi } from 'vitest';
import { render, screen, within, waitFor } from '@/tests/utils';
import userEvent from '@testing-library/user-event';

// Mock router hooks to render ResultadoPago in isolation
vi.mock('@tanstack/react-router', () => {
  return {
    useSearch: vi.fn(),
    useNavigate: vi.fn(),
  };
});

import ResultadoPago from './ResultadoPago';
import * as RouterHooks from '@tanstack/react-router';

describe('ResultadoPago (component)', () => {
  it('renders success state when status=approved', async () => {
    RouterHooks.useSearch.mockReturnValue({
      status: 'approved',
      nombre_participante: 'Ana',
      nombre_curso: 'Curso',
      fecha_curso: '2025-01-01',
      monto: 'USD 99.99',
      email_facturacion: 'ana@example.com',
    });
    render(<ResultadoPago />);

    let dialog;
    try {
      dialog = await waitFor(() => screen.getByRole('dialog'), {
        timeout: 1500,
      });
    } catch {
      dialog = await waitFor(() => screen.getByTestId('resultado-dialog'), {
        timeout: 1500,
      });
    }
    // Title and message inside dialog
    await within(dialog).findByRole('heading', { level: 1, name: /pago/i });
    expect(
      within(dialog).getByText(/Felicitaciones, Ana!/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Resumen de la transacción/)).toBeInTheDocument();
    expect(screen.getByText(/Factura:/)).toBeInTheDocument();
    // Button
    expect(await screen.findByText(/listo/i)).toBeInTheDocument();
  });

  it('renders failure state when status=failed', async () => {
    RouterHooks.useSearch.mockReturnValue({
      status: 'failed',
      nombre_participante: 'Ana',
      nombre_curso: 'Curso',
      fecha_curso: '2025-01-01',
      monto: 'USD 99.99',
    });
    render(<ResultadoPago />);

    let dialog;
    try {
      dialog = await waitFor(() => screen.getByRole('dialog'), {
        timeout: 1500,
      });
    } catch {
      dialog = await waitFor(() => screen.getByTestId('resultado-dialog'), {
        timeout: 1500,
      });
    }
    await within(dialog).findByRole('heading', { level: 1, name: /error/i });
    expect(within(dialog).getByText(/Lo sentimos, Ana/)).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Detalles del intento/),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: /reintentar/i }),
    ).toBeInTheDocument();
  });

  // Mapping in route config is out of scope here.

  it('closes dialog and navigates home on dialog close', async () => {
    const mockNavigate = vi.fn();
    RouterHooks.useSearch.mockReturnValue({
      status: 'approved',
      nombre_participante: 'Ana',
    });
    RouterHooks.useNavigate.mockReturnValue(mockNavigate);
    render(<ResultadoPago />);

    let dialog;
    try {
      dialog = await waitFor(() => screen.getByRole('dialog'), {
        timeout: 1500,
      });
    } catch {
      dialog = await waitFor(() => screen.getByTestId('resultado-dialog'), {
        timeout: 1500,
      });
    }
    const closeBtn = within(dialog).getByRole('button', { name: /listo/i });
    expect(closeBtn).toBeTruthy();
    // Clicking the Radix Dialog.Close button triggers navigation to '/'
    await userEvent.click(closeBtn);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/',
      search: {},
      replace: true,
    });
  });
});
