import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Sections lazy loading', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  const baseMocks = (isMobile) => {
    vi.doMock('@tanstack/react-router', () => ({
      Outlet: () => null,
    }));
    vi.doMock('../Hero.jsx', () => ({
      default: () => <div data-testid="hero" />,
    }));
    vi.doMock('../Cursos.jsx', () => ({
      default: () => <div data-testid="cursos" />,
    }));
    vi.doMock('@/features/checkout/CheckoutEntry', () => ({
      CheckoutEntry: ({ children }) => (
        <div data-testid="checkout-entry">{children}</div>
      ),
    }));
    vi.doMock('@/features/checkout/CheckoutFlow', () => ({
      default: () => <div data-testid="checkout-flow" />,
    }));
    vi.doMock('@/hooks/useIsMobile', () => ({ useIsMobile: () => isMobile }));
  };

  const sectionsPath = path.resolve(__dirname, '../Sections.jsx');

  const createDeferred = () => {
    let resolve;
    const promise = new Promise((res) => {
      resolve = res;
    });
    return { promise, resolve };
  };

  it('lazily loads Intervenciones on desktop', async () => {
    const deferred = createDeferred();
    const mockIntervenciones = () => <div data-testid="intervenciones" />;
    const loader = vi.fn(() => deferred.promise);

    vi.resetModules();
    vi.clearAllMocks();
    baseMocks(false);
    vi.doMock('../loadIntervenciones', () => ({
      loadIntervenciones: loader,
    }));

    const Sections = (await import('../Sections.jsx')).default;

    render(
      <Suspense>
        <Sections />
      </Suspense>,
    );

    await waitFor(() => {
      expect(loader).toHaveBeenCalledTimes(1);
    });
    expect(
      await screen.findByTestId('intervenciones-loading'),
    ).toBeInTheDocument();

    deferred.resolve({ default: mockIntervenciones });
    await waitFor(() => {
      expect(screen.getByTestId('intervenciones')).toBeInTheDocument();
    });
  });

  it('avoids loading Intervenciones on mobile', async () => {
    const deferred = createDeferred();
    const loader = vi.fn(() => deferred.promise);

    vi.resetModules();
    vi.clearAllMocks();
    baseMocks(true);
    vi.doMock('../loadIntervenciones', () => ({
      loadIntervenciones: loader,
    }));

    const Sections = (await import('../Sections.jsx')).default;

    render(
      <Suspense>
        <Sections />
      </Suspense>,
    );

    expect(loader).not.toHaveBeenCalled();
    expect(screen.queryByTestId('intervenciones-loading')).toBeNull();
  });

  it('lazily loads AgilidadProfunda on desktop', async () => {
    const deferred = createDeferred();
    const mockAgilidad = () => <div data-testid="agilidad" />;
    const loader = vi.fn(() => deferred.promise);

    vi.resetModules();
    vi.clearAllMocks();
    baseMocks(false);
    vi.doMock('../loadIntervenciones', () => ({
      loadIntervenciones: () => Promise.resolve({ default: () => null }),
    }));
    vi.doMock('../loadAgilidadProfunda', () => ({
      loadAgilidadProfunda: loader,
    }));

    const Sections = (await import('../Sections.jsx')).default;

    render(
      <Suspense>
        <Sections />
      </Suspense>,
    );

    await waitFor(() => {
      expect(loader).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByTestId('agilidad-loading')).toBeInTheDocument();

    deferred.resolve({ default: mockAgilidad });
    await waitFor(() => {
      expect(screen.getByTestId('agilidad')).toBeInTheDocument();
    });
  });

  it('avoids loading AgilidadProfunda on mobile', async () => {
    const deferred = createDeferred();
    const loader = vi.fn(() => deferred.promise);

    vi.resetModules();
    vi.clearAllMocks();
    baseMocks(true);
    vi.doMock('../loadAgilidadProfunda', () => ({
      loadAgilidadProfunda: loader,
    }));
    vi.doMock('../loadIntervenciones', () => ({
      loadIntervenciones: () => Promise.resolve({ default: () => null }),
    }));

    const Sections = (await import('../Sections.jsx')).default;

    render(
      <Suspense>
        <Sections />
      </Suspense>,
    );

    expect(loader).not.toHaveBeenCalled();
    expect(screen.queryByTestId('agilidad-loading')).toBeNull();
  });

  it('does not contain a static Intervenciones import', () => {
    vi.resetModules();
    vi.clearAllMocks();
    const source = fs.readFileSync(sectionsPath, 'utf8');
    expect(source.includes("from './Intervenciones'")).toBe(false);
    expect(source.includes('loadIntervenciones')).toBe(true);
    expect(source.includes("from './AgilidadProfunda'")).toBe(false);
    expect(source.includes('loadAgilidadProfunda')).toBe(true);
  });
});
