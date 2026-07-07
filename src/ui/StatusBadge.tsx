import { type CSSProperties } from 'react';
import type { RequestStatus } from '../data/types';

const STATUS: Record<RequestStatus, { bg: string; fg: string; dot: string; label: string }> = {
  new:      { bg: 'var(--status-new-bg)',      fg: 'var(--status-new-fg)',      dot: 'var(--status-new-dot)',      label: 'New' },
  modify:   { bg: 'var(--status-modify-bg)',   fg: 'var(--status-modify-fg)',   dot: 'var(--status-modify-dot)',   label: 'Modify/Add' },
  manual:   { bg: 'var(--status-manual-bg)',   fg: 'var(--status-manual-fg)',   dot: 'var(--status-manual-dot)',   label: 'Manual Processing' },
  notfound: { bg: 'var(--status-notfound-bg)', fg: 'var(--status-notfound-fg)', dot: 'var(--status-notfound-dot)', label: 'Physician Not Found' },
  special:  { bg: 'var(--status-special-bg)',  fg: 'var(--status-special-fg)',  dot: 'var(--status-special-dot)',  label: 'Pending Special Approval' },
};

interface StatusBadgeProps {
  /** Request process-flow state. @default 'new' */
  status?: RequestStatus;
  /** sm for table rows, md for the detail header. @default 'sm' */
  size?: 'sm' | 'md';
  /** Override the default label text for the status. */
  label?: string;
  style?: CSSProperties;
}

/**
 * StatusBadge — the process-flow chip for a physician request.
 * status: new | modify | manual | notfound | special.
 * size: sm (table rows) | md (detail header).
 */
export function StatusBadge({ status = 'new', size = 'sm', label, style }: StatusBadgeProps) {
  const s = STATUS[status] || STATUS.new;
  const lg = size === 'md';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      gap: lg ? '7px' : '6px',
      padding: lg ? '6px 14px' : '4px 10px',
      borderRadius: 'var(--radius-pill)',
      background: s.bg, color: s.fg,
      fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)',
      fontSize: lg ? 'var(--fs-mono)' : 'var(--fs-label)',
      whiteSpace: 'nowrap',
      ...style,
    }}>
      <span style={{
        width: lg ? '7px' : '6px', height: lg ? '7px' : '6px',
        borderRadius: '50%', background: s.dot,
      }} />
      {label || s.label}
    </span>
  );
}
