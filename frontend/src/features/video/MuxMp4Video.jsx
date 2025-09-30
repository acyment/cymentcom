import React from 'react';
import InlineVideo from '@/components/InlineVideo';
import { MUX_MP4_MAP } from '@/features/video/muxMp4Map';

export default function MuxMp4Video({ playbackId, className }) {
  const entry = MUX_MP4_MAP[playbackId];
  if (!entry) return null;
  return (
    <InlineVideo
      poster={entry.poster}
      sources={entry.sources}
      className={className}
    />
  );
}
