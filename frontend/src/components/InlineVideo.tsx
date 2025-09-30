import React, { useRef, useState, useEffect } from 'react';

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [startIndex, setStartIndex] = useState(0);

  // Basic fallback: on error, try the next source once
  const handleError: React.ReactEventHandler<HTMLVideoElement> = () => {
    if (startIndex < sources.length - 1) {
      setStartIndex((i) => i + 1);
    }
  };

  // When startIndex changes, reload the element to pick up new <source> order
  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.load();
      } catch {
        // no-op in test/SSR
      }
    }
  }, [startIndex]);

  return (
    // role is implicit, but tests sometimes query by role in strict mode; we keep native semantics
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      controls={controls}
      preload={preload}
      playsInline={playsInline}
      muted={muted}
      autoPlay={autoPlay}
      loop={loop}
      onError={handleError}
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {sources.slice(startIndex).map((s, i) => (
        <source key={i} src={s.src} type={s.type ?? 'video/mp4'} />
      ))}
    </video>
  );
}

export default InlineVideo;
