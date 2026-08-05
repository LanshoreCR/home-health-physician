import { type CSSProperties } from 'react';

interface SkeletonProps {
  /** Width — number is px, string passes through (e.g. '62%'). */
  w?: number | string;
  h?: number | string;
  radius?: string;
  style?: CSSProperties;
}

/**
 * Skeleton — shimmering placeholder block. The animation lives in
 * styles/skeleton.css so the keyframes are declared once.
 */
export function Skeleton({ w = '100%', h = 12, radius = 'var(--radius-sm)', style }: SkeletonProps) {
  return <span className="skeleton" style={{ width: w, height: h, borderRadius: radius, ...style }} />;
}
