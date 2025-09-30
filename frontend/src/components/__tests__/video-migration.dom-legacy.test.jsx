import React from 'react';
import { render, cleanup } from '@/tests/utils';
import ResilientMuxPlayer from '@/components/ResilientMuxPlayer.jsx';

describe('Legacy DOM usage (to be removed)', () => {
  afterEach(() => cleanup());

  it('page components should not render <mux-player> (temporary failing guard)', () => {
    // Render a minimal wrapper that currently uses Mux Player
    render(<ResilientMuxPlayer playbackId="test_playback" />);
    // Target state (after migration): no <mux-player> present
    expect(document.querySelector('mux-player')).toBeNull();
  });
});
