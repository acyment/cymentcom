import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Sections composition', () => {
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
    vi.doMock('../ComoTrabajo.jsx', () => ({
      default: () => <div data-testid="como-trabajo" />,
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

  it('renders Hero, Cursos and ComoTrabajo on the homepage', async () => {
    vi.resetModules();
    vi.clearAllMocks();
    baseMocks(false);

    const Sections = (await import('../Sections.jsx')).default;

    render(
      <Suspense>
        <Sections />
      </Suspense>,
    );

    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('cursos')).toBeInTheDocument();
    expect(screen.getByTestId('como-trabajo')).toBeInTheDocument();
  });

  it('keeps Cursos on mobile while omitting AgilidadProfunda', async () => {
    const agilidadLoader = vi.fn(() =>
      Promise.resolve({ default: () => <div data-testid="agilidad" /> }),
    );

    vi.resetModules();
    vi.clearAllMocks();
    baseMocks(true);
    vi.doMock('../loadAgilidadProfunda', () => ({
      loadAgilidadProfunda: agilidadLoader,
    }));

    const Sections = (await import('../Sections.jsx')).default;

    render(
      <Suspense>
        <Sections />
      </Suspense>,
    );

    expect(screen.getByTestId('cursos')).toBeInTheDocument();
    expect(agilidadLoader).not.toHaveBeenCalled();
    expect(screen.queryByTestId('agilidad-loading')).toBeNull();
  });

  it('does not reference Intervenciones or AgilidadProfunda', () => {
    vi.resetModules();
    vi.clearAllMocks();
    const source = fs.readFileSync(sectionsPath, 'utf8');
    expect(source.includes('Intervenciones')).toBe(false);
    expect(source.includes('loadIntervenciones')).toBe(false);
    expect(source.includes("from './AgilidadProfunda'")).toBe(false);
    expect(source.includes('loadAgilidadProfunda')).toBe(false);
  });
});
