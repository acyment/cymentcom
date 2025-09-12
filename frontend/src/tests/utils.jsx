import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Test utilities for consistent component testing

/**
 * Custom render function that wraps components with providers
 */
export function renderWithProviders(ui, options = {}) {
  const {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = {},
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return <div data-testid="test-wrapper">{children}</div>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Mock API response helper
 */
export function createMockApiResponse(data, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  };
}

/**
 * Mock payment form data
 */
export const mockPaymentFormData = {
  participantes: [
    {
      nombre: 'John',
      apellido: 'Doe',
      email: 'john.doe@example.com',
      telefono: '+1234567890',
    },
  ],
  facturacion: {
    pais: 'US',
    razon_social: 'Test Company',
    cuit: '',
  },
  procesador_pago: 'stripe',
};

/**
 * Mock course data
 */
export const mockCourseData = {
  id: 1,
  tipo_curso: {
    id: 1,
    titulo: 'Test Course',
    descripcion: 'A test course description',
    precio_usd: { amount: '99.99', currency: 'USD' },
    precio_ars: { amount: '85000.00', currency: 'ARS' },
  },
  fecha_inicio: '2024-02-01',
};

/**
 * Helper to wait for async operations
 */
export const waitFor = async (callback, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      try {
        const result = callback();
        if (result) {
          resolve(result);
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 10);
        }
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(error);
        } else {
          setTimeout(check, 10);
        }
      }
    };

    check();
  });
};

export * from '@testing-library/react';
export { vi } from 'vitest';
