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
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[220px] overflow-hidden"
    >
      {/* Blob 1 – large, slow drift */}
      <div className="animated-glow-blob blob-1" />
      {/* Blob 2 – medium, counter-drift */}
      <div className="animated-glow-blob blob-2" />
      {/* Blob 3 – small accent */}
      <div className="animated-glow-blob blob-3" />
      {/* Bottom fade-out mask */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};
