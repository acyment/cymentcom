import React, { useRef, useState, useEffect } from 'react';

export default function InlineVideo({
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
}) {
  const videoRef = useRef(null);
  const [startIndex, setStartIndex] = useState(0);
  const firedRef = useRef(new Set());

  const handleError = () => {
    if (startIndex < sources.length - 1) setStartIndex((i) => i + 1);
  };
  const handlePlay = () => onAnalytics?.({ type: 'play' });
  const handlePause = () => onAnalytics?.({ type: 'pause' });
  const handleEnded = () => onAnalytics?.({ type: 'ended' });
  const handleTimeUpdate = (e) => {
    if (!onAnalytics) return;
    const el = e.currentTarget;
    const d = el.duration;
    const t = el.currentTime;
    if (!isFinite(d) || d <= 0) return;
    const ratio = t / d;
    const milestones = [0.25, 0.5, 0.75];
    for (const m of milestones) {
      if (ratio >= m && !firedRef.current.has(m)) {
        firedRef.current.add(m);
        onAnalytics({ type: 'progress', progress: m });
        break;
      }
    }
  };

  useEffect(() => {
    if (videoRef.current?.load) {
      try {
        videoRef.current.load();
      } catch {}
    }
  }, [startIndex]);

  useEffect(() => {
    firedRef.current.clear();
  }, [startIndex, sources]);

  return (
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

export { InlineVideo as __type_shim__ };
