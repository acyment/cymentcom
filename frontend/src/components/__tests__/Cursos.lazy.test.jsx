import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@/tests/utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, afterEach } from 'vitest';

const buildCoursePayload = () => ({
  nombre_corto: 'TM',
  nombre_completo: 'Test Masterclass',
  resumen_una_linea: 'Resumen corto',
  resumen: 'Descripción breve del curso',
  foto: 'curso.jpg',
  foto_tint: 'curso_tint.jpg',
  contenido: '<ul><li>Módulo 1</li></ul>',
  contenido_corto: '<ul><li>Módulo 1</li></ul>',
  faq_entries: [
    {
      pregunta: '¿Incluye certificado?',
      respuesta: 'Sí, al completar todas las clases.',
    },
  ],
  costo_usd: { amount: '250.00', currency: 'USD' },
  costo_ars: { amount: '200000.00', currency: 'ARS' },
  costo_sin_descuento_ars: { amount: '220000.00', currency: 'ARS' },
  costo_sin_descuento_usd: { amount: '280.00', currency: 'USD' },
  video: 'mock-playback-id',
  upcoming_courses: [
    {
      id: 101,
      fecha: '2025-03-10',
      hora_inicio: '09:00',
      hora_fin: '12:30',
      cantidad_dias: 5,
    },
  ],
});

const createDeferred = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const baseMocks = ({ isMobile, loadDetalle }) => {
  vi.doMock('axios', () => ({
    default: {
      get: vi.fn(() => Promise.resolve({ data: [buildCoursePayload()] })),
    },
  }));
  vi.doMock('@/hooks/useIsMobile', () => ({ useIsMobile: () => isMobile }));
  vi.doMock('posthog-js/react', () => ({
    usePostHog: () => ({ capture: vi.fn() }),
  }));
  vi.doMock('@/features/checkout/useOpenCheckout', () => ({
    useOpenCheckout: () => vi.fn(),
  }));
  vi.doMock('keen-slider/react', () => ({
    useKeenSlider: () => [() => {}, null],
  }));
  vi.doMock('react-spinners/CircleLoader', () => ({
    default: () => <div data-testid="circle-loader" />,
  }));
  vi.doMock('./ResilientMuxPlayer', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-mux-player" />,
  }));
  if (loadDetalle) {
    vi.doMock('../loadDetalleCurso', () => ({
      loadDetalleCurso: loadDetalle,
    }));
  }
};

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('Cursos lazy loading', () => {
  it('loads DetalleCurso on demand for desktop users', async () => {
    const deferred = createDeferred();
    const loader = vi.fn(() => deferred.promise);
    const mockDetalle = React.forwardRef(({ tipoCurso, ...rest }, ref) => (
      <div data-testid="detalle-curso" ref={ref} {...rest} />
    ));

    baseMocks({ isMobile: false, loadDetalle: loader });

    const Cursos = (await import('../Cursos.jsx')).default;

    render(
      <Suspense>
        <Cursos />
      </Suspense>,
    );

    const toggle = await screen.findByRole('radio', {
      name: /test masterclass/i,
    });
    await userEvent.click(toggle);

    await waitFor(() => {
      expect(loader).toHaveBeenCalledTimes(1);
    });
    expect(
      await screen.findByTestId('detalle-curso-loading'),
    ).toBeInTheDocument();

    deferred.resolve({ default: mockDetalle });
    await waitFor(() => {
      expect(screen.getByTestId('detalle-curso')).toBeInTheDocument();
    });
  });

  it('does not load DetalleCurso for mobile drawer flow', async () => {
    const deferred = createDeferred();
    const loader = vi.fn(() => deferred.promise);

    baseMocks({ isMobile: true, loadDetalle: loader });

    const Cursos = (await import('../Cursos.jsx')).default;

    render(
      <Suspense>
        <Cursos />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Resumen corto/i)).toBeInTheDocument();
    });
    expect(loader).not.toHaveBeenCalled();
  });
});
