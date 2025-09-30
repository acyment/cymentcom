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
  onAnalytics?: (payload: {
    type: 'play' | 'pause' | 'ended' | 'progress';
    progress?: 0.25 | 0.5 | 0.75;
  }) => void;
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
  onAnalytics,
}: InlineVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const firedRef = useRef<Set<number>>(new Set());

  // Basic fallback: on error, try the next source once
  const handleError: React.ReactEventHandler<HTMLVideoElement> = () => {
    if (startIndex < sources.length - 1) {
      setStartIndex((i) => i + 1);
    }
  };

  const handlePlay: React.ReactEventHandler<HTMLVideoElement> = () => {
    onAnalytics?.({ type: 'play' });
  };

  const handlePause: React.ReactEventHandler<HTMLVideoElement> = () => {
    onAnalytics?.({ type: 'pause' });
  };

  const handleEnded: React.ReactEventHandler<HTMLVideoElement> = () => {
    onAnalytics?.({ type: 'ended' });
  };

  const handleTimeUpdate: React.ReactEventHandler<HTMLVideoElement> = (e) => {
    if (!onAnalytics) return;
    const el = e.currentTarget;
    const d = el.duration;
    const t = el.currentTime;
    if (!isFinite(d) || d <= 0) return;
    const ratio = t / d;
    const milestones: Array<{ p: number; v: 0.25 | 0.5 | 0.75 }> = [
      { p: 0.25, v: 0.25 },
      { p: 0.5, v: 0.5 },
      { p: 0.75, v: 0.75 },
    ];
    for (const m of milestones) {
      if (ratio >= m.p && !firedRef.current.has(m.p)) {
        firedRef.current.add(m.p);
        onAnalytics({ type: 'progress', progress: m.v });
        break;
      }
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

  // Reset milestone set when sources or playback restarts
  useEffect(() => {
    firedRef.current.clear();
  }, [startIndex, sources]);

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
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handleEnded}
      onTimeUpdate={handleTimeUpdate}
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {sources.slice(startIndex).map((s, i) => (
        <source key={i} src={s.src} type={s.type ?? 'video/mp4'} />
      ))}
    </video>
  );
}

export default InlineVideo;
