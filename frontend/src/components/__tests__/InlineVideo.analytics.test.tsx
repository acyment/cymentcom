import React from 'react';
import { vi } from 'vitest';
import { render } from '@/tests/utils';

describe('InlineVideo (analytics)', () => {
  it('emits play/pause/ended and progress milestones (25/50/75)', async () => {
    const { InlineVideo } = await import('../InlineVideo');
    const onAnalytics = vi.fn();

    const { container } = render(
      <InlineVideo
        poster="/p.jpg"
        sources={[
          { src: 'https://cdn.mux.com/demo-720.mp4', type: 'video/mp4' },
        ]}
        onAnalytics={onAnalytics as any}
      />,
    );

    const video = container.querySelector('video')! as HTMLVideoElement;

    // Mock duration/currentTime so we can drive timeupdate
    let _duration = 100;
    let _current = 0;
    Object.defineProperty(video, 'duration', {
      configurable: true,
      get: () => _duration,
    });
    Object.defineProperty(video, 'currentTime', {
      configurable: true,
      get: () => _current,
      set: (v: number) => {
        _current = v;
      },
    });

    // play → event fired
    video.dispatchEvent(new Event('play'));
    expect(onAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'play' }),
    );

    // Cross 25%
    video.currentTime = 26; // 26/100 > .25
    video.dispatchEvent(new Event('timeupdate'));
    expect(onAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'progress', progress: 0.25 }),
    );

    // Cross 50%
    video.currentTime = 51;
    video.dispatchEvent(new Event('timeupdate'));
    expect(onAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'progress', progress: 0.5 }),
    );

    // Cross 75% — multiple timeupdates should not duplicate
    video.currentTime = 76;
    video.dispatchEvent(new Event('timeupdate'));
    video.currentTime = 90;
    video.dispatchEvent(new Event('timeupdate'));
    const progressCalls = onAnalytics.mock.calls.filter(
      (c) => c[0]?.type === 'progress' && c[0]?.progress === 0.75,
    );
    expect(progressCalls.length).toBe(1);

    // pause and ended
    video.dispatchEvent(new Event('pause'));
    expect(onAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'pause' }),
    );

    video.currentTime = 100;
    video.dispatchEvent(new Event('ended'));
    expect(onAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ended' }),
    );
  });
});
