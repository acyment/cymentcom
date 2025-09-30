import React from 'react';
import MuxMp4Video from '@/features/video/MuxMp4Video';

// Backwards-compatible shim so existing tests and imports keep working
// after removing @mux/mux-player-react from the bundle.
export default function ResilientMuxPlayer({
  playbackId,
  className,
  ...props
}) {
  return <MuxMp4Video playbackId={playbackId} className={className} />;
}
