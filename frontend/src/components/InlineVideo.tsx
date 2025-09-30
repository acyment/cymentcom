import React from 'react';

export type VideoSource = { src: string; type?: string };

export type InlineVideoProps = {
  poster?: string;
  sources: VideoSource[];
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  playsInline?: boolean;
  className?: string;
  muted?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
};

export function InlineVideo({
  poster,
  sources,
  controls = true,
  preload = 'metadata',
  playsInline = true,
  className,
  muted,
  autoPlay,
  loop,
}: InlineVideoProps) {
  return (
    // role is implicit, but tests sometimes query by role in strict mode; we keep native semantics
    <video
      className={className}
      poster={poster}
      controls={controls}
      preload={preload}
      playsInline={playsInline}
      muted={muted}
      autoPlay={autoPlay}
      loop={loop}
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {sources.map((s, i) => (
        <source key={i} src={s.src} type={s.type ?? 'video/mp4'} />
      ))}
    </video>
  );
}

export default InlineVideo;
