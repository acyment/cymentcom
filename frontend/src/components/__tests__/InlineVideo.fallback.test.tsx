import React from 'react';
import { render, screen, waitFor } from '@/tests/utils';

describe('InlineVideo (fallback)', () => {
  it('switches to the next source on error', async () => {
    const sources = [
      { src: 'https://cdn.mux.com/demo-720.mp4', type: 'video/mp4' },
      { src: 'https://cdn.mux.com/demo-480.mp4', type: 'video/mp4' },
    ];

    const { InlineVideo } = await import('../InlineVideo');
    const { container } = render(
      <InlineVideo poster="/p.jpg" sources={sources} />,
    );

    const video = container.querySelector('video')!;
    const firstSourceBefore = video.querySelector('source')!;
    expect(firstSourceBefore.getAttribute('src')).toBe(sources[0].src);

    // Simulate a playback error on the video element
    video.dispatchEvent(new Event('error'));

    await waitFor(() => {
      const firstSourceAfter = container
        .querySelector('video')!
        .querySelector('source')!;
      expect(firstSourceAfter.getAttribute('src')).toBe(sources[1].src);
    });
  });
});
