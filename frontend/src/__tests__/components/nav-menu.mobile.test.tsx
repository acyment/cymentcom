import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import NavMenu from '@/components/NavMenu';

vi.mock('posthog-js/react', () => ({
  usePostHog: () => null,
}));

describe('NavMenu mobile underline', () => {
  const defineLayout = (el: HTMLElement, top: number, height: number) => {
    Object.defineProperty(el, 'offsetTop', {
      configurable: true,
      value: top,
    });
    Object.defineProperty(el, 'offsetHeight', {
      configurable: true,
      value: height,
    });
  };

  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const hero = document.createElement('section');
    hero.id = 'hero';
    defineLayout(hero, 0, 200);
    document.body.appendChild(hero);

    const intervenciones = document.createElement('section');
    intervenciones.id = 'intervenciones';
    defineLayout(intervenciones, 60, 400);
    document.body.appendChild(intervenciones);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps the underline on “Inicio” on initial render', async () => {
    render(<NavMenu />);

    const inicio = screen.getByRole('link', { name: 'Inicio' });
    const intervenciones = screen.getByRole('link', {
      name: 'Intervenciones',
    });

    await waitFor(() => {
      expect(inicio).toHaveAttribute('aria-current', 'true');
    });
    expect(intervenciones).not.toHaveAttribute('aria-current');
  });
});
