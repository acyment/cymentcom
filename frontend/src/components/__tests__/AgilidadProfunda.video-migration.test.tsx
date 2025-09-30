import React from 'react';
import { render } from '@/tests/utils';
import { vi } from 'vitest';

vi.mock('react-rough-notation', () => ({
  __esModule: true,
  RoughNotation: ({ children }: any) => <>{children}</>,
  RoughNotationGroup: ({ children }: any) => <>{children}</>,
}));
vi.mock('@radix-ui/react-accordion', () => ({
  __esModule: true,
  Item: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  Header: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  Trigger: ({ children, ...p }: any) => <button {...p}>{children}</button>,
  Content: ({ children, ...p }: any) => <div {...p}>{children}</div>,
}));

vi.mock('@/features/video/videoFlags', () => ({
  __esModule: true,
  USE_INLINE_VIDEO: true,
}));

vi.mock('@/features/video/muxMp4Map', () => ({
  __esModule: true,
  MUX_MP4_MAP: {
    '01jQAtccLD74At5jA5J02gU1cDkgacdF2v9jA400HeqxGI': {
      poster:
        'https://image.mux.com/01jQAtccLD74At5jA5J02gU1cDkgacdF2v9jA400HeqxGI/thumbnail.jpg',
      sources: [
        {
          src: 'https://stream.mux.com/01jQAtccLD74At5jA5J02gU1cDkgacdF2v9jA400HeqxGI/720p.mp4',
          type: 'video/mp4',
        },
        {
          src: 'https://stream.mux.com/01jQAtccLD74At5jA5J02gU1cDkgacdF2v9jA400HeqxGI/480p.mp4',
          type: 'video/mp4',
        },
      ],
    },
  },
}));

describe('AgilidadProfunda video migration (flagged)', () => {
  it('renders native <video> (no <mux-player>)', async () => {
    const mod = await import('../AgilidadProfunda.jsx');
    const Comp = mod.default;
    const { container } = render(<Comp />);
    expect(container.querySelector('video')).not.toBeNull();
    expect(document.querySelector('mux-player')).toBeNull();
  });
});
