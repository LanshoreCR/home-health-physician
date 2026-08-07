import { type CSSProperties } from 'react';
import { statusColors } from '../data/labels';
import type { RequestStatus } from '../data/types';

interface StatusBadgeProps {
  /** Request process-flow state. @default 'newreq' */
  status?: RequestStatus;
  /** sm for table rows, md for the detail header. @default 'sm' */
  size?: 'sm' | 'md';
  /** Display text for the status; falls back to the raw code. */
  label?: string;
  style?: CSSProperties;
}

/**
 * StatusBadge — the process-flow chip for a physician request.
 * status: newreq | duplicate | modify | manual | special | denied | approved.
 * size: sm (table rows) | md (detail header).
 */
export function StatusBadge({ status = 'newreq', size = 'sm', label, style }: StatusBadgeProps) {
  const colors = statusColors(status);
  const lg = size === 'md';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      gap: lg ? '7px' : '6px',
      padding: lg ? '6px 14px' : '4px 10px',
      borderRadius: 'var(--radius-pill)',
      background: colors.bg, color: colors.fg,
      fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)',
      fontSize: lg ? 'var(--fs-mono)' : 'var(--fs-label)',
      whiteSpace: 'nowrap',
      ...style,
    }}>
      <span style={{
        width: lg ? '7px' : '6px', height: lg ? '7px' : '6px',
        borderRadius: '50%', background: colors.dot,
      }} />
      {label ?? status}
    </span>
  );
}
