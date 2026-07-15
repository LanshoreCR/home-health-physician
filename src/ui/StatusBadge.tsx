import { type CSSProperties } from 'react';
import type { RequestStatus } from '../data/types';

const STATUS: Record<RequestStatus, { bg: string; fg: string; dot: string; label: string }> = {
  newreq:    { bg: 'var(--status-newreq-bg)',    fg: 'var(--status-newreq-fg)',    dot: 'var(--status-newreq-dot)',    label: 'New Request' },
  duplicate: { bg: 'var(--status-duplicate-bg)', fg: 'var(--status-duplicate-fg)', dot: 'var(--status-duplicate-dot)', label: 'Duplicate Phy/NPI' },
  modify:    { bg: 'var(--status-modify-bg)',    fg: 'var(--status-modify-fg)',    dot: 'var(--status-modify-dot)',    label: 'Modify Physician' },
  manual:    { bg: 'var(--status-manual-bg)',    fg: 'var(--status-manual-fg)',    dot: 'var(--status-manual-dot)',    label: 'Manual Entry' },
  special:   { bg: 'var(--status-special-bg)',   fg: 'var(--status-special-fg)',   dot: 'var(--status-special-dot)',   label: 'Special Approval Requested' },
  denied:    { bg: 'var(--status-denied-bg)',    fg: 'var(--status-denied-fg)',    dot: 'var(--status-denied-dot)',    label: 'Request Denied' },
  approved:  { bg: 'var(--status-approved-bg)',  fg: 'var(--status-approved-fg)',  dot: 'var(--status-approved-dot)',  label: 'Request Approved' },
};

interface StatusBadgeProps {
  /** Request process-flow state. @default 'newreq' */
  status?: RequestStatus;
  /** sm for table rows, md for the detail header. @default 'sm' */
  size?: 'sm' | 'md';
  /** Override the default label text for the status. */
  label?: string;
  style?: CSSProperties;
}

/**
 * StatusBadge — the process-flow chip for a physician request.
 * status: newreq | duplicate | modify | manual | special | denied | approved.
 * size: sm (table rows) | md (detail header).
 */
export function StatusBadge({ status = 'newreq', size = 'sm', label, style }: StatusBadgeProps) {
  const s = STATUS[status] || STATUS.newreq;
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
