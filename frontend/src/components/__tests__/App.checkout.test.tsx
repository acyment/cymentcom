import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('use-font-face-observer', () => ({
  __esModule: true,
  default: () => true,
}));
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...rest }) => (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a {...rest}>{children}</a>
  ),
  useLocation: vi.fn(),
}));
vi.mock('../../hooks/useIsMobile', () => ({ useIsMobile: vi.fn() }));
vi.mock('../Logo.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="logo" />,
}));
vi.mock('../NavMenu.jsx', () => ({
  __esModule: true,
  default: () => <nav data-testid="nav-menu" />,
}));
vi.mock('../Contacto.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="contacto" />,
}));

describe('App chrome on mobile checkout', () => {
  let useLocation;
  let useIsMobile;
  let App;

  beforeAll(async () => {
    useLocation = (await import('@tanstack/react-router')).useLocation;
    useIsMobile = (await import('../../hooks/useIsMobile')).useIsMobile;
    App = (await import('../App.jsx')).default;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides header and footer when we are on /checkout in mobile view', () => {
    useIsMobile.mockReturnValue(true);
    useLocation.mockReturnValue({ pathname: '/checkout' });

    render(<App>Checkout</App>);

    expect(screen.queryByTestId('nav-menu')).not.toBeInTheDocument();
    expect(screen.queryByTestId('contacto')).not.toBeInTheDocument();
  });

  it('keeps header/footer on desktop checkout', () => {
    useIsMobile.mockReturnValue(false);
    useLocation.mockReturnValue({ pathname: '/checkout' });

    render(<App>Checkout</App>);

    expect(screen.getByTestId('nav-menu')).toBeInTheDocument();
    expect(screen.getByTestId('contacto')).toBeInTheDocument();
  });
});
