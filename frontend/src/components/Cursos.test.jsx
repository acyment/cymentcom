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

import CourseDetailPanel from './CourseDetailPanel.jsx';

vi.mock('./loadCourseDetailPanel', () => ({
  loadCourseDetailPanel: vi.fn(() =>
    Promise.resolve({
      default: CourseDetailPanel,
    }),
  ),
}));

import axios from 'axios';
import userEvent from '@testing-library/user-event';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@/tests/utils';
import Cursos, { __clearCursosCache } from './Cursos';
import { __clearCourseDetailCache } from './CourseDetail';

let scrollIntoViewSpy;

beforeAll(() => {
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {};
  }
  scrollIntoViewSpy = vi
    .spyOn(HTMLElement.prototype, 'scrollIntoView')
    .mockImplementation(() => {});
});

beforeEach(() => {
  mockUseIsMobile.mockImplementation(() => false);
  mockUseIsMobile.mockClear();
  mockNavigate.navigate.mockReset();
  __clearCourseDetailCache();
  __clearCursosCache();
  scrollIntoViewSpy?.mockClear();
});

describe('Cursos loader', () => {
  it('renders the circle loader while data is still loading', () => {
    const onCourseDetailReady = vi.fn();
    render(<Cursos onCourseDetailReady={onCourseDetailReady} />);
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
  contenido: [
    {
      module_title: 'Módulo 1',
      summary: 'Resumen breve',
      topics: [
        {
          topic_title: 'Fundamentos',
          lessons: [{ title: 'Fundamentos', description: '' }],
        },
      ],
    },
    {
      module_title: 'Módulo 2',
      summary: '',
      topics: [
        {
          topic_title: 'Práctica',
          lessons: [{ title: 'Práctica', description: '' }],
        },
      ],
    },
  ],
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

    const onCourseDetailReady = vi.fn();
    render(<Cursos onCourseDetailReady={onCourseDetailReady} />);

    const toggle = await screen.findByRole('radio', {
      name: /test masterclass/i,
    });
    await userEvent.click(toggle);

    const detailPanel = await screen.findByTestId('CourseDetailPanel');
    const accordion = within(detailPanel).getByTestId(
      'CourseContentsAccordion',
    );
    expect(accordion).toBeInTheDocument();

    await waitFor(() =>
      expect(onCourseDetailReady).toHaveBeenCalledWith(detailPanel),
    );

    expect(
      screen.getByText(/en 5 sesiones diarias de 3\.5 hs cada una/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Descripción breve del curso', { exact: false }),
    ).toBeInTheDocument();
    const moduleTrigger = screen.getByRole('button', { name: /módulo 1/i });
    expect(moduleTrigger).toBeInTheDocument();
    await userEvent.click(moduleTrigger);
    expect(screen.getAllByText(/fundamentos/i)[0]).toBeInTheDocument();
    expect(screen.getByText('¿Incluye certificado?')).toBeInTheDocument();
  });

  it('invokes onCourseDetailReady when initialSlug is provided', async () => {
    axios.get.mockResolvedValueOnce({
      data: [buildCoursePayload()],
    });

    const onCourseDetailReady = vi.fn();

    render(
      <Cursos initialSlug="TM" onCourseDetailReady={onCourseDetailReady} />,
    );

    const detailPanel = await screen.findByTestId('CourseDetailPanel');

    await waitFor(() =>
      expect(onCourseDetailReady).toHaveBeenCalledWith(detailPanel),
    );
  });

  it('scrolls to the loader immediately when deep linking before data resolves', async () => {
    const pending = new Promise(() => {});
    axios.get.mockReturnValueOnce(pending);

    render(<Cursos initialSlug="TM" onCourseDetailReady={vi.fn()} />);

    await waitFor(() => expect(scrollIntoViewSpy).toHaveBeenCalled());
    const firstInstance = scrollIntoViewSpy.mock.instances[0];
    expect(firstInstance?.id).toBe('cursos');
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

describe('Cursos mobile temario (caracterización)', () => {
  afterEach(() => {
    mockUseIsMobile.mockImplementation(() => false);
  });

  it('muestra el temario normalizado en la tarjeta móvil', async () => {
    mockUseIsMobile.mockImplementation(() => true);
    const payload = buildCoursePayload();

    axios.get.mockResolvedValueOnce({ data: [payload] });

    render(<Cursos />);

    const contentsHeading = await screen.findByRole('heading', {
      name: /¿qué vas a aprender\?/i,
      level: 4,
    });
    const contentsSection = contentsHeading.closest('.CourseCardContents');
    expect(contentsSection).not.toBeNull();
    expect(contentsHeading).toHaveClass('CourseCardContentsTitle');

    const topicTitle = within(contentsSection).getByRole('heading', {
      name: /fundamentos/i,
      level: 3,
    });
    expect(topicTitle).toHaveClass('CourseContentsTopicTitle');

    const lessonRow = contentsSection.querySelector('.CourseContentsLesson');
    expect(lessonRow).not.toBeNull();
    expect(
      lessonRow.querySelector('.CourseContentsLessonTitle')?.textContent,
    ).toMatch(/fundamentos/i);
  });
});
