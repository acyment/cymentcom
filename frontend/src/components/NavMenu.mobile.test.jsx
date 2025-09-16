import React from 'react';
import { render, screen, waitFor } from '@/tests/utils';
import userEvent from '@testing-library/user-event';
import NavMenu from './NavMenu';

function mockMatchMedia({ mobile = false } = {}) {
  const listeners = new Set();
  const impl = vi.fn().mockImplementation((query) => {
    const isMobileQuery = /max-width\s*:\s*767px/.test(query);
    const matches = mobile ? isMobileQuery : !isMobileQuery;
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn((cb) => listeners.add(cb)),
      removeListener: vi.fn((cb) => listeners.delete(cb)),
      addEventListener: vi.fn((_, cb) => listeners.add(cb)),
      removeEventListener: vi.fn((_, cb) => listeners.delete(cb)),
      dispatchEvent: vi.fn((ev) => {
        for (const cb of listeners) cb(ev);
        return true;
      }),
    };
  });
  Object.defineProperty(window, 'matchMedia', { writable: true, value: impl });
  return { impl };
}

describe('NavMenu (mobile behavior)', () => {
  it('shows inline nav with key links and no hamburger on mobile', async () => {
    mockMatchMedia({ mobile: true });
    render(<NavMenu />);

    // No hamburger button
    expect(
      screen.queryByRole('button', { name: /menu/i }),
    ).not.toBeInTheDocument();
    // Inline links are present
    expect(
      await screen.findByRole('link', { name: 'Inicio' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cursos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contacto' })).toBeInTheDocument();
    // No dialog is rendered
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('NavMenu (desktop behavior)', () => {
  it('shows inline menu and no hamburger on desktop', async () => {
    mockMatchMedia({ mobile: false });
    render(<NavMenu />);

    expect(
      screen.queryByRole('button', { name: /menu/i }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'Cursos' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contacto' })).toBeInTheDocument();
  });
});

it('annotations: desktop shows hover-only circle, mobile shows current underline', async () => {
  // Desktop: no annotation until hover
  mockMatchMedia({ mobile: false });
  const { unmount } = render(<NavMenu />);
  const cursos = await screen.findByRole('link', { name: 'Cursos' });
  expect(document.querySelector('.NavNotation')).not.toBeInTheDocument();
  await userEvent.hover(cursos);
  expect(document.querySelector('.NavNotation')).toBeInTheDocument();

  // Mobile: only the current item has underline annotation
  unmount();
  mockMatchMedia({ mobile: true });
  render(<NavMenu />);
  await screen.findByRole('link', { name: 'Inicio' });
  const current = document.querySelector('.NavNotation--current');
  expect(current).toBeInTheDocument();
  expect(document.querySelectorAll('.NavNotation').length).toBe(1);
});
