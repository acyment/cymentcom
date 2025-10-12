import React from 'react';
import { vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('@/hooks/useIsHandheld', () => ({
  useIsHandheld: () => false,
  useIsCoarse: () => false,
}));

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));

vi.mock('keen-slider/react', () => ({
  useKeenSlider: () => [() => {}, null],
}));

vi.mock('@tanstack/react-router-devtools', () => ({
  TanStackRouterDevtools: () => null,
}));

vi.mock('use-font-face-observer', () => ({
  __esModule: true,
  default: () => true,
}));

vi.mock('@/components/DesktopCourseExperience', () => ({
  __esModule: true,
  default: ({ slug }) => (
    <div data-testid="desktop-course-experience">{slug}</div>
  ),
}));

import CourseDetailPanel from '@/components/CourseDetailPanel.jsx';

vi.mock('@/components/loadCourseDetailPanel', () => ({
  loadCourseDetailPanel: vi.fn(() =>
    Promise.resolve({
      default: CourseDetailPanel,
    }),
  ),
}));

const openCheckoutMock = vi.fn();

vi.mock('@/features/checkout/useOpenCheckout', () => ({
  useOpenCheckout: () => openCheckoutMock,
}));

import axios from 'axios';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/tests/utils';
import { __clearCursosCache } from '@/components/Cursos';
import {
  RouterProvider,
  createRouter,
  createMemoryHistory,
} from '@tanstack/react-router';
import { routeTree } from '@/routes/routes';

const buildCourse = (slug, overrides = {}) => ({
  nombre_corto: slug,
  nombre_completo: `${slug} Title`,
  resumen_una_linea: `${slug} summary`,
  resumen: `${slug} description`,
  costo_usd: { amount: '100.00', currency: 'USD' },
  costo_ars: { amount: '50000.00', currency: 'ARS' },
  faq_entries: [],
  contenido: [],
  upcoming_courses: [],
  ...overrides,
});

describe('Desktop catalogue routing (current behaviour)', () => {
  beforeEach(() => {
    axios.get.mockReset();
    openCheckoutMock.mockReset();
    window.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
    __clearCursosCache();
  });

  it('keeps the URL on "/" while switching courses in desktop carousel', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/tipos-de-curso') {
        return Promise.resolve({
          data: [
            buildCourse('CSM', { resumen: 'CSM description' }),
            buildCourse('CLB', { resumen: 'CLB description' }),
          ],
        });
      }
      if (url === '/api/tipos-de-curso/CLB/') {
        return Promise.resolve({ data: buildCourse('CLB') });
      }
      if (url === '/api/tipos-de-curso/CSM/') {
        return Promise.resolve({ data: buildCourse('CSM') });
      }
      return Promise.reject(new Error(`Unexpected request to ${url}`));
    });

    const history = createMemoryHistory({ initialEntries: ['/'] });
    const router = createRouter({ routeTree, history });
    render(<RouterProvider router={router} />);

    await screen.findByText(/CSM Title/i);
    const clbHeading = await screen.findByText(/CLB Title/i);

    expect(history.location.pathname).toBe('/');

    await userEvent.click(clbHeading);

    expect(history.location.pathname).toBe('/');
    expect(await screen.findByText(/CLB Title/)).toBeInTheDocument();

    const csmHeading = await screen.findByText(/CSM Title/i);
    await userEvent.click(csmHeading);
    expect(history.location.pathname).toBe('/');
    expect(await screen.findByText(/CSM Title/)).toBeInTheDocument();
  });

  it('deep links to /cursos/CLB and shows desktop catalogue with that course selected', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/tipos-de-curso') {
        return Promise.resolve({
          data: [buildCourse('CSM'), buildCourse('CLB')],
        });
      }
      if (url === '/api/tipos-de-curso/CLB/') {
        return Promise.resolve({ data: buildCourse('CLB') });
      }
      if (url === '/api/tipos-de-curso/CSM/') {
        return Promise.resolve({ data: buildCourse('CSM') });
      }
      return Promise.reject(new Error(`Unexpected request to ${url}`));
    });

    const history = createMemoryHistory({ initialEntries: ['/cursos/CLB'] });
    const router = createRouter({ routeTree, history });
    render(<RouterProvider router={router} />);

    expect(history.location.pathname).toBe('/cursos/CLB');
    expect(await screen.findByText(/Agilidad para/i)).toBeInTheDocument();
    expect(await screen.findByText(/CLB Title/)).toBeInTheDocument();
    expect(screen.getByText(/CSM summary/)).toBeInTheDocument();
  });

  it('deep links without triggering hero auto-scroll on desktop', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/api/tipos-de-curso') {
        return Promise.resolve({
          data: [
            buildCourse('CSM', { resumen: 'CSM description' }),
            buildCourse('CLB', { resumen: 'CLB description' }),
          ],
        });
      }
      if (url === '/api/tipos-de-curso/CLB/') {
        return Promise.resolve({ data: buildCourse('CLB') });
      }
      if (url === '/api/tipos-de-curso/CSM/') {
        return Promise.resolve({ data: buildCourse('CSM') });
      }
      return Promise.reject(new Error(`Unexpected request to ${url}`));
    });

    const scrollCalls = [];
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (options) {
      scrollCalls.push({ target: this, options });
    };

    try {
      const history = createMemoryHistory({ initialEntries: ['/cursos/CLB'] });
      const router = createRouter({ routeTree, history });
      render(<RouterProvider router={router} />);

      await screen.findByText(/CLB Title/i);
      await screen.findByTestId('CourseDetailPanel', undefined, {
        timeout: 5000,
      });
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }

    const targets = scrollCalls.map(({ target }) => ({
      id: target?.id ?? null,
      className: target?.className ?? '',
    }));

    if (originalScrollIntoView?.mock) {
      originalScrollIntoView.mock.instances.forEach((instance) => {
        targets.push({
          id: instance?.id ?? null,
          className: instance?.className ?? '',
        });
      });
    }

    const detailScrolls = targets.filter(({ id }) => id === 'detalle-curso');
    const heroScrolls = targets.filter(
      ({ className }) =>
        typeof className === 'string' && className.includes('HeroContent'),
    );

    expect(detailScrolls.length).toBeGreaterThan(0);
    expect(heroScrolls).toHaveLength(0);
  });
});
