import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { render, screen } from '@/tests/utils';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Hero from './Hero';

vi.mock('posthog-js/react', () => ({
  usePostHog: () => null,
}));

vi.mock('react-rough-notation', () => ({
  RoughNotation: ({ children }) => <span>{children}</span>,
  RoughNotationGroup: ({ children }) => <>{children}</>,
}));

const renderHero = () =>
  render(
    <Accordion.Root type="multiple">
      <Hero />
    </Accordion.Root>,
  );

describe('Hero copy and CTAs', () => {
  it('shows the updated positioning copy', () => {
    renderHero();

    expect(
      screen.getByText(
        /Alan Cyment — Diseño organizacional y desarrollo de producto\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /20 años reduciendo fricción organizacional con ejecutivos, líderes y equipos\./,
      ),
    ).toBeInTheDocument();
  });

  it('links the primary CTA to LinkedIn', () => {
    renderHero();

    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/alancyment/',
    );
  });

  it('keeps Contacto scrolling to the contact section', async () => {
    const scrollIntoView = vi.fn();
    const contacto = document.createElement('section');
    contacto.id = 'contacto';
    contacto.scrollIntoView = scrollIntoView;
    document.body.appendChild(contacto);

    renderHero();
    await userEvent.click(screen.getByRole('button', { name: 'Contacto' }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });
});
