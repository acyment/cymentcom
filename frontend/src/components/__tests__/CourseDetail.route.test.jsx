import React from 'react';
import { vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => true,
}));

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));

const openCheckoutMock = vi.fn();

vi.mock('@/features/checkout/useOpenCheckout', () => ({
  useOpenCheckout: vi.fn(() => openCheckoutMock),
}));

vi.mock('keen-slider/react', () => ({
  useKeenSlider: () => [() => {}, null],
}));
vi.mock('@tanstack/react-router-devtools', () => ({
  TanStackRouterDevtools: () => null,
}));

vi.mock('react-spinners/CircleLoader', () => ({
  __esModule: true,
  default: () => <div data-testid="course-detail-spinner" />,
}));

vi.mock('use-font-face-observer', () => ({
  __esModule: true,
  default: () => true,
}));

import axios from 'axios';
import userEvent from '@testing-library/user-event';
import { render, act } from '@testing-library/react';
import { screen, waitFor, within } from '@/tests/utils';
import {
  RouterProvider,
  createRouter,
  createMemoryHistory,
} from '@tanstack/react-router';
import { routeTree } from '@/routes/routes';
import { __clearCourseDetailCache } from '@/components/CourseDetail';
import { __clearCursosCache } from '@/components/Cursos';

const buildCourse = () => ({
  nombre_corto: 'TM',
  nombre_completo: 'Test Masterclass',
  resumen_una_linea: 'Resumen corto',
  resumen: 'Descripción breve del curso',
  contenido: '<ul><li>Módulo 1: Fundamentos</li></ul>',
  faq_entries: [{ pregunta: '¿Incluye certificado?', respuesta: 'Sí.' }],
  costo_usd: { amount: '250.00', currency: 'USD' },
  costo_ars: { amount: '200000.00', currency: 'ARS' },
  video: 'mock',
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

describe('CourseDetail route', () => {
  beforeEach(() => {
    axios.get.mockReset();
    __clearCourseDetailCache();
    __clearCursosCache();
  });

  it('navigates to /cursos/TM and renders detail heading (no dialog)', async () => {
    axios.get.mockImplementation((url) => {
      if (/\/api\/tipos-de-curso\//.test(url)) {
        return Promise.resolve({ data: buildCourse() });
      }
      return Promise.resolve({ data: [buildCourse()] });
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    render(<RouterProvider router={router} />);

    const more = await screen.findByRole('button', {
      name: /ver más detalles/i,
    });
    await userEvent.click(more);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/cursos/TM');
      expect(
        screen.getByRole('heading', { name: /test masterclass/i, level: 1 }),
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    expect(
      screen.queryByRole('link', { name: /ir al inicio/i }),
    ).not.toBeInTheDocument();
    const stickyHeader = screen.getByTestId('CourseDetailHeader');
    expect(stickyHeader).toHaveStyle({ position: 'sticky' });
  });

  it('shows loading state while fetching course detail', async () => {
    let resolveDetail;
    axios.get.mockImplementation((url) => {
      if (/\/api\/tipos-de-curso\/TM/.test(url)) {
        return new Promise((resolve) => {
          resolveDetail = resolve;
        });
      }
      if (url === '/api/tipos-de-curso') {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/cursos/TM'] }),
    });
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/cursos/TM');
    });

    await screen.findByTestId('course-detail-spinner');
    expect(
      screen.getByText(/cargando/i, { selector: '.LoaderLegend' }),
    ).toBeInTheDocument();

    await act(async () => {
      resolveDetail({ data: buildCourse() });
    });

    await screen.findByRole('heading', { name: /test masterclass/i, level: 1 });
  });

  it('shows error message and allows retry', async () => {
    const detailMock = vi
      .fn(() => Promise.resolve({ data: buildCourse() }))
      .mockImplementationOnce(() => Promise.reject(new Error('boom')))
      .mockImplementationOnce(() => Promise.resolve({ data: buildCourse() }));

    axios.get.mockImplementation((url) => {
      if (/\/api\/tipos-de-curso\/TM/.test(url)) {
        return detailMock();
      }
      if (url === '/api/tipos-de-curso') {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/cursos/TM'] }),
    });
    render(<RouterProvider router={router} />);

    await screen.findByText(/no pudimos cargar el curso/i);
    expect(detailMock).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    await waitFor(() => {
      expect(detailMock).toHaveBeenCalledTimes(2);
      expect(
        screen.getByRole('heading', { name: /test masterclass/i, level: 1 }),
      ).toBeInTheDocument();
    });
  });

  it('renders all course sections with schedule, structure, description, contents, and FAQ', async () => {
    axios.get.mockImplementation((url) => {
      if (/\/api\/tipos-de-curso\//.test(url)) {
        return Promise.resolve({ data: buildCourse() });
      }
      return Promise.resolve({ data: [buildCourse()] });
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    render(<RouterProvider router={router} />);

    const more = await screen.findByRole('button', {
      name: /ver más detalles/i,
    });
    await userEvent.click(more);

    await screen.findByRole('heading', { name: /test masterclass/i, level: 1 });

    expect(
      screen.getByRole('heading', { name: /próximos cursos/i, level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/mex\/(?:cri|costa rica) \[gmt-6] 06:00 a 09:30 hs\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ecu\/(?:per|perú) \[gmt-5] 07:00 a 10:30 hs\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/arg\/uru \[gmt-3] 09:00 a 12:30 hs\./i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /estructura/i, level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /lunes a viernes en 5 sesiones diarias de 3\.5 hs cada una/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /descripción/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Descripción breve del curso')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /contenidos/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/módulo 1: fundamentos/i)).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /preguntas frecuentes/i, level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /¿incluye certificado\?/i }),
    ).toBeInTheDocument();
  });

  it('provides an in-page navigation bar that links to each course section', async () => {
    axios.get.mockImplementation((url) => {
      if (/\/api\/tipos-de-curso\//.test(url)) {
        return Promise.resolve({ data: buildCourse() });
      }
      return Promise.resolve({ data: [buildCourse()] });
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    render(<RouterProvider router={router} />);

    const more = await screen.findByRole('button', {
      name: /ver más detalles/i,
    });
    await userEvent.click(more);

    await screen.findByRole('heading', { name: /test masterclass/i, level: 1 });

    const nav = screen.getByRole('navigation', { name: /detalles del curso/i });
    const horariosLink = within(nav).getByRole('link', { name: /horarios/i });
    const estructuraLink = within(nav).getByRole('link', {
      name: /estructura/i,
    });
    const descripcionLink = within(nav).getByRole('link', {
      name: /descripción/i,
    });
    const contenidosLink = within(nav).getByRole('link', {
      name: /contenidos/i,
    });
    const faqLink = within(nav).getByRole('link', {
      name: /preguntas frecuentes/i,
    });

    expect(horariosLink).toHaveAttribute('href', '#horarios');
    expect(estructuraLink).toHaveAttribute('href', '#estructura');
    expect(descripcionLink).toHaveAttribute('href', '#descripcion');
    expect(contenidosLink).toHaveAttribute('href', '#contenidos');
    expect(faqLink).toHaveAttribute('href', '#faq');

    expect(
      screen
        .getByRole('heading', { name: /próximos cursos/i, level: 2 })
        .closest('section'),
    ).toHaveAttribute('id', 'horarios');
    expect(
      screen
        .getByRole('heading', { name: /estructura/i, level: 2 })
        .closest('section'),
    ).toHaveAttribute('id', 'estructura');
    expect(
      screen
        .getByRole('heading', { name: /descripción/i, level: 2 })
        .closest('section'),
    ).toHaveAttribute('id', 'descripcion');
    expect(
      screen
        .getByRole('heading', { name: /contenidos/i, level: 2 })
        .closest('section'),
    ).toHaveAttribute('id', 'contenidos');
    expect(
      screen
        .getByRole('heading', { name: /preguntas frecuentes/i, level: 2 })
        .closest('section'),
    ).toHaveAttribute('id', 'faq');

    await userEvent.click(estructuraLink);
    expect(window.location.hash).toBe('#estructura');
  });

  it('shows a sticky enroll button that opens checkout with the active course', async () => {
    openCheckoutMock.mockReset();

    axios.get.mockImplementation((url) => {
      if (/\/api\/tipos-de-curso\//.test(url)) {
        return Promise.resolve({ data: buildCourse() });
      }
      return Promise.resolve({ data: [buildCourse()] });
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    render(<RouterProvider router={router} />);

    const more = await screen.findByRole('button', {
      name: /ver más detalles/i,
    });
    await userEvent.click(more);

    await screen.findByRole('heading', { name: /test masterclass/i, level: 1 });

    const enrollButton = screen.getByRole('button', { name: /inscribirme/i });
    await userEvent.click(enrollButton);

    expect(openCheckoutMock).toHaveBeenCalledWith({
      idCurso: 101,
      nombreCorto: 'TM',
      costoUSD: { amount: '250.00', currency: 'USD' },
      costoARS: { amount: '200000.00', currency: 'ARS' },
    });
  });

  it('lets the user return to the home catalog from the detail page', async () => {
    const listMock = vi.fn(() => Promise.resolve({ data: [buildCourse()] }));
    axios.get.mockImplementation((url) => {
      if (url === '/api/tipos-de-curso') {
        return listMock();
      }
      if (/\/api\/tipos-de-curso\//.test(url)) {
        return Promise.resolve({ data: buildCourse() });
      }
      return Promise.resolve({ data: [] });
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    render(<RouterProvider router={router} />);

    const more = await screen.findByRole('button', {
      name: /ver más detalles/i,
    });
    await userEvent.click(more);

    await screen.findByRole('heading', { name: /test masterclass/i, level: 1 });

    const backLink = screen.getByRole('link', { name: /volver al catálogo/i });
    expect(
      backLink.querySelector('svg[data-lucide="arrow-left"]'),
    ).not.toBeNull();
    await userEvent.click(backLink);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
    expect(listMock).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', { name: /ver más detalles/i }),
    ).toBeInTheDocument();
  });

  it('renders FAQ entries inside an accordion and reveals answers on toggle', async () => {
    axios.get.mockImplementation((url) => {
      if (/\/api\/tipos-de-curso\/TM/.test(url)) {
        return Promise.resolve({
          data: {
            ...buildCourse(),
            faq_entries: [
              { pregunta: '¿Incluye certificado?', respuesta: 'Sí.' },
              { pregunta: '¿Necesito experiencia previa?', respuesta: 'No.' },
            ],
          },
        });
      }
      if (url === '/api/tipos-de-curso') {
        return Promise.resolve({ data: [buildCourse()] });
      }
      return Promise.resolve({ data: [] });
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    render(<RouterProvider router={router} />);

    const more = await screen.findByRole('button', {
      name: /ver más detalles/i,
    });
    await userEvent.click(more);

    await screen.findByRole('heading', {
      name: /preguntas frecuentes/i,
      level: 2,
    });

    const accordion = screen.getByTestId('CourseDetailFaqAccordion');
    const trigger = within(accordion).getByRole('button', {
      name: /¿incluye certificado\?/i,
    });

    expect(screen.queryByText('Sí.')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.getByText('Sí.')).toBeInTheDocument();
  });

  it('collapses contenidos by default and reveals the full list when expanding', async () => {
    axios.get.mockImplementation((url) => {
      if (/\/api\/tipos-de-curso\/TM/.test(url)) {
        return Promise.resolve({
          data: {
            ...buildCourse(),
            contenido:
              '<ul><li>Módulo 1</li><li>Módulo 2</li><li>Módulo 3</li></ul>',
            contenido_corto: '<ul><li>Módulo 1</li></ul>',
          },
        });
      }
      return Promise.resolve({ data: [buildCourse()] });
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    render(<RouterProvider router={router} />);

    const more = await screen.findByRole('button', {
      name: /ver más detalles/i,
    });
    await userEvent.click(more);

    await screen.findByRole('heading', { name: /contenidos/i, level: 2 });
    expect(screen.queryByText(/módulo 3/i)).not.toBeInTheDocument();

    const revealButton = await screen.findByText(/ver más/i);
    await userEvent.click(revealButton);
    expect(screen.getByText(/módulo 3/i)).toBeInTheDocument();
  });

  it('uses scrollIntoView for section navigation', async () => {
    axios.get.mockImplementation((url) => {
      if (/\/api\/tipos-de-curso\//.test(url)) {
        return Promise.resolve({ data: buildCourse() });
      }
      return Promise.resolve({ data: [buildCourse()] });
    });

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    render(<RouterProvider router={router} />);

    const more = await screen.findByRole('button', {
      name: /ver más detalles/i,
    });
    await userEvent.click(more);

    const nav = screen.getByRole('navigation', { name: /detalles del curso/i });
    const estructuraLink = within(nav).getByRole('link', {
      name: /estructura/i,
    });
    const estructuraSection = screen
      .getByRole('heading', { name: /estructura/i, level: 2 })
      .closest('section');
    estructuraSection.scrollIntoView = vi.fn();

    await userEvent.click(estructuraLink);

    expect(estructuraSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
    expect(window.location.hash).toBe('#estructura');
  });

  it('applies header height to scroll padding when offsetHeight is zero', async () => {
    axios.get.mockImplementation((url) => {
      if (/\/api\/tipos-de-curso\//.test(url)) {
        return Promise.resolve({ data: buildCourse() });
      }
      return Promise.resolve({ data: [buildCourse()] });
    });

    const measuredHeight = 120;
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;

    let observerCallback;
    class ResizeObserverMock {
      constructor(callback) {
        observerCallback = callback;
      }

      observe(target) {
        this.target = target;
      }

      unobserve() {}

      disconnect() {}
    }

    global.ResizeObserver = ResizeObserverMock;

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    render(<RouterProvider router={router} />);

    const more = await screen.findByRole('button', {
      name: /ver más detalles/i,
    });
    await userEvent.click(more);

    const nav = screen.getByRole('navigation', { name: /detalles del curso/i });
    Object.defineProperty(nav, 'offsetHeight', {
      value: 40,
      configurable: true,
    });
    const estructuraLink = within(nav).getByRole('link', {
      name: /estructura/i,
    });

    const header = await screen.findByTestId('CourseDetailHeader');
    Object.defineProperty(header, 'offsetHeight', {
      value: 0,
      configurable: true,
    });
    observerCallback([
      { target: header, contentRect: { height: measuredHeight } },
    ]);

    await userEvent.click(estructuraLink);

    expect(
      document.documentElement.style.getPropertyValue(
        '--course-detail-header-height',
      ),
    ).toBe('120px');
    expect(
      document.documentElement.style.getPropertyValue(
        '--course-detail-header-offset',
      ),
    ).toBe('60px');
    expect(document.documentElement.style.scrollPaddingTop).toBe('60px');

    delete global.ResizeObserver;
  });
});
