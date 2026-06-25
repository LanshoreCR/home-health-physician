import { type CSSProperties } from 'react';
import type { RequestStatus } from '../data/types';

const STATUS: Record<RequestStatus, { bg: string; fg: string; dot: string; label: string }> = {
  submitted: { bg: 'var(--status-submitted-bg)', fg: 'var(--status-submitted-fg)', dot: 'var(--status-submitted-dot)', label: 'Submitted' },
  pending:   { bg: 'var(--status-pending-bg)',   fg: 'var(--status-pending-fg)',   dot: 'var(--status-pending-dot)',   label: 'Pending Review' },
  approved:  { bg: 'var(--status-approved-bg)',  fg: 'var(--status-approved-fg)',  dot: 'var(--status-approved-dot)',  label: 'Approved' },
  rejected:  { bg: 'var(--status-rejected-bg)',  fg: 'var(--status-rejected-fg)',  dot: 'var(--status-rejected-dot)',  label: 'Rejected' },
  exported:  { bg: 'var(--status-exported-bg)',  fg: 'var(--status-exported-fg)',  dot: 'var(--status-exported-dot)',  label: 'Exported' },
};

interface StatusBadgeProps {
  /** Request lifecycle state. @default 'submitted' */
  status?: RequestStatus;
  /** sm for table rows, md for the detail header. @default 'sm' */
  size?: 'sm' | 'md';
  /** Override the default label text for the status. */
  label?: string;
  style?: CSSProperties;
}

/**
 * StatusBadge — the lifecycle chip for a physician request.
 * status: submitted | pending | approved | rejected | exported.
 * size: sm (table rows) | md (detail header).
 */
export function StatusBadge({ status = 'submitted', size = 'sm', label, style }: StatusBadgeProps) {
  const s = STATUS[status] || STATUS.submitted;
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
