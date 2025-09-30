import React from 'react';
import { render, screen } from '@/tests/utils';
import { vi } from 'vitest';

// Mock UI-heavy deps to keep test light
vi.mock('react-multi-carousel', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="carousel">{children}</div>,
}));
vi.mock('react-rough-notation', () => ({
  __esModule: true,
  RoughNotation: ({ children }: any) => <>{children}</>,
}));
vi.mock('@radix-ui/react-accordion', () => ({
  __esModule: true,
  Item: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  Header: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  Trigger: ({ children, ...p }: any) => <button {...p}>{children}</button>,
  Content: ({ children, ...p }: any) => <div {...p}>{children}</div>,
}));

// Enable the migration flag
vi.mock('@/features/video/videoFlags', () => ({
  __esModule: true,
  USE_INLINE_VIDEO: true,
}));

// Provide a small MP4 mapping for the three IDs used in Intervenciones
vi.mock('@/features/video/muxMp4Map', () => ({
  __esModule: true,
  MUX_MP4_MAP: {
    iH01rVinOT5iOINLo026IY00KoOU00MEFHlHXBfK0100c21vg: {
      poster: '/static/images/caso1.jpg',
      sources: [
        { src: 'https://cdn.mux.com/caso1-720.mp4', type: 'video/mp4' },
        { src: 'https://cdn.mux.com/caso1-480.mp4', type: 'video/mp4' },
      ],
    },
    Uwv6f00UdVR8s6HFeVP4RQFIl2BEY3QgzmcovYvG1Q004: {
      poster: '/static/images/caso2.jpg',
      sources: [
        { src: 'https://cdn.mux.com/caso2-720.mp4', type: 'video/mp4' },
      ],
    },
    '5JEBYRXpkpKbHv9AGIX84zh8LLUPDZjIxhwWjouTzok': {
      poster: '/static/images/caso3.jpg',
      sources: [
        { src: 'https://cdn.mux.com/caso3-720.mp4', type: 'video/mp4' },
      ],
    },
  },
}));

describe('Intervenciones video migration (flagged)', () => {
  it('renders native <video> and no <mux-player> when migration flag is enabled', async () => {
    const module = await import('../Intervenciones.jsx');
    const Intervenciones = module.default;
    const { container } = render(<Intervenciones />);

    const videoEl = container.querySelector('video');
    expect(videoEl).not.toBeNull();
    expect(document.querySelector('mux-player')).toBeNull();
  });
});
