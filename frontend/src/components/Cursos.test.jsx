import React from 'react';
import { vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => new Promise(() => {})),
  },
}));

vi.mock('react-spinners/CircleLoader', () => ({
  default: () => <div data-testid="circle-loader" />,
}));

const { mockUseIsMobile } = vi.hoisted(() => ({
  mockUseIsMobile: vi.fn(() => false),
}));
vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: mockUseIsMobile,
}));

const mockNavigate = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate.navigate,
  };
});

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    capture: vi.fn(),
  }),
}));

vi.mock('@/features/checkout/useOpenCheckout', () => ({
  useOpenCheckout: () => vi.fn(),
}));

vi.mock('keen-slider/react', () => ({
  useKeenSlider: () => [() => {}, null],
}));

vi.mock('./ResilientMuxPlayer', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-mux-player" />,
}));

import axios from 'axios';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/tests/utils';
import Cursos from './Cursos';
import { __clearCourseDetailCache } from './CourseDetail';

beforeAll(() => {
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {};
  }
  vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(
    () => {},
  );
});

beforeEach(() => {
  mockUseIsMobile.mockImplementation(() => false);
  mockUseIsMobile.mockClear();
  mockNavigate.navigate.mockReset();
  __clearCourseDetailCache();
});

describe('Cursos loader', () => {
  it('renders the circle loader while data is still loading', () => {
    render(<Cursos />);
    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
  });

  it('renders the “Cargando...” legend beneath the loader', () => {
    render(<Cursos />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });
});

const buildCoursePayload = () => ({
  nombre_corto: 'TM',
  nombre_completo: 'Test Masterclass',
  resumen_una_linea: 'Resumen corto',
  resumen: 'Descripción breve del curso',
  foto: 'curso.jpg',
  foto_tint: 'curso_tint.jpg',
  contenido:
    '<ul><li>Módulo 1: Fundamentos</li><li>Módulo 2: Práctica</li></ul>',
  contenido_corto: '<ul><li>Módulo 1: Fundamentos</li></ul>',
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

describe('Cursos desktop details', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  it('shows the full course detail block after selecting a course', async () => {
    axios.get.mockResolvedValueOnce({
      data: [buildCoursePayload()],
    });

    render(<Cursos />);

    const toggle = await screen.findByRole('radio', {
      name: /test masterclass/i,
    });
    await userEvent.click(toggle);

    await waitFor(() =>
      expect(
        screen.getByText(/MEX\/CRI \[GMT-6] 06:00 a 09:30 hs\./i),
      ).toBeInTheDocument(),
    );

    expect(
      screen.getByText(/en 5 sesiones diarias de 3\.5 hs cada una/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Descripción breve del curso', { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Módulo 1: Fundamentos', { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText('¿Incluye certificado?')).toBeInTheDocument();
  });

  it('sends the selected course in navigation state on mobile', async () => {
    mockUseIsMobile.mockImplementation(() => true);
    axios.get.mockResolvedValueOnce({
      data: [buildCoursePayload()],
    });

    render(<Cursos />);

    const more = await screen.findByRole('button', {
      name: /ver más detalles/i,
    });
    await userEvent.click(more);

    expect(mockNavigate.navigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/cursos/$slug',
        params: { slug: 'TM' },
        state: {
          course: expect.objectContaining({ nombre_corto: 'TM' }),
        },
      }),
    );
  });
});
