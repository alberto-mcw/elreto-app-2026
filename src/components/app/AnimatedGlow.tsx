import { useEffect, useRef } from 'react';

/**
 * Animated gradient glow that renders behind the AppHeader.
 * Uses pure CSS animations with multiple layered radial-gradient blobs
 * that drift, scale and fade to create an organic warm-light effect.
 * Works in both light and dark mode.
 */
export const AnimatedGlow = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[260px] overflow-hidden"
    >
      {/* Blob 1 – large left warm glow */}
      <div className="animated-glow-blob blob-1" />
      {/* Blob 2 – large right warm glow */}
      <div className="animated-glow-blob blob-2" />
      {/* Blob 3 – center bridge glow */}
      <div className="animated-glow-blob blob-3" />
      {/* Blob 4 – subtle wide ambient */}
      <div className="animated-glow-blob blob-4" />
      {/* Bottom fade-out mask */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};
