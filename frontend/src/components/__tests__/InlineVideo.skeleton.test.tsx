import React from 'react';
import { render, screen } from '@/tests/utils';

// RED: InlineVideo component doesn't exist yet or lacks required attributes
describe('InlineVideo (skeleton)', () => {
  it('renders a native <video> with controls, playsInline, preload="metadata" and poster', async () => {
    const poster = '/static/images/demo-poster.jpg';
    const sources = [
      { src: 'https://cdn.mux.com/demo-720.mp4', type: 'video/mp4' },
    ];

    // Dynamic import to avoid hoisting failures before file exists
    const { InlineVideo } = await import('../InlineVideo');

    render(<InlineVideo poster={poster} sources={sources} />);

    const video =
      screen.getByRole('video', { hidden: true }) ||
      (document.querySelector('video') as HTMLVideoElement | null);
    expect(video).not.toBeNull();
    if (!video) return;
    expect(video.getAttribute('controls')).not.toBeNull();
    expect(video.getAttribute('playsinline')).not.toBeNull();
    expect(video.getAttribute('preload')).toBe('metadata');
    expect(video.getAttribute('poster')).toBe(poster);

    // Must include at least one MP4 source
    const source = video.querySelector('source');
    expect(source).not.toBeNull();
    if (!source) return;
    expect(source.getAttribute('type')).toMatch(/video\/mp4/);
  });
});
