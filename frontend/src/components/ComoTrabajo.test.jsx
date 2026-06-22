import React from 'react';
import { render, screen } from '@/tests/utils';
import { vi } from 'vitest';
import ComoTrabajo from './ComoTrabajo';

vi.mock('react-rough-notation', () => ({
  RoughNotation: ({ children }) => <span>{children}</span>,
  RoughNotationGroup: ({ children }) => <>{children}</>,
}));

describe('ComoTrabajo section', () => {
  it('renders the section heading', () => {
    render(<ComoTrabajo />);
    expect(
      screen.getByRole('heading', { name: 'Cómo trabajo' }),
    ).toBeInTheDocument();
  });

  it('renders all four service titles', () => {
    render(<ComoTrabajo />);
    [
      'Consultoría organizacional',
      'Facilitación estratégica',
      'Programas de liderazgo',
      'Formación',
    ].forEach((t) =>
      expect(screen.getByRole('heading', { name: t })).toBeInTheDocument(),
    );
  });

  it('renders each service description', () => {
    render(<ComoTrabajo />);
    expect(screen.getByText(/eliminar cuellos de botella/)).toBeInTheDocument();
    expect(
      screen.getByText(/stakeholders con intereses en conflicto/),
    ).toBeInTheDocument();
    expect(screen.getByText(/colaboración entre áreas/)).toBeInTheDocument();
    expect(screen.getByText(/4000 profesionales formados/)).toBeInTheDocument();
  });
});
