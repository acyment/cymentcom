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
  it('shows hamburger and hides inline menu on mobile', async () => {
    mockMatchMedia({ mobile: true });
    render(<NavMenu />);

    const burger = await screen.findByRole('button', { name: /menu/i });
    expect(burger).toBeInTheDocument();

    expect(screen.queryByText('Cursos')).not.toBeInTheDocument();
    expect(screen.queryByText('Contacto')).not.toBeInTheDocument();
  });

  it('opens overlay with links when hamburger is clicked', async () => {
    mockMatchMedia({ mobile: true });
    render(<NavMenu />);

    const burger = await screen.findByRole('button', { name: /menu/i });
    await userEvent.click(burger);

    const dialog = await waitFor(() => screen.getByRole('dialog'), {
      timeout: 2000,
    });
    expect(screen.getByRole('link', { name: 'Cursos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contacto' })).toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
  });

  it('closes overlay on Escape', async () => {
    mockMatchMedia({ mobile: true });
    render(<NavMenu />);

    const burger = await screen.findByRole('button', { name: /menu/i });
    await userEvent.click(burger);
    await waitFor(() => screen.getByRole('dialog'), { timeout: 2000 });

    await userEvent.keyboard('{Escape}');
    // Radix removes dialog from DOM on close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
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
