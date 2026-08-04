import type { RequestStatus, StatusFilter } from './types';

export interface StatusMeta {
  label: string;
  sub: string;
}

const META: Record<RequestStatus, StatusMeta> = {
  newreq: { label: 'New Request', sub: 'Clean · ready to export' },
  duplicate: { label: 'Duplicate Phy/NPI', sub: 'Possible duplicate · needs resolution' },
  modify: { label: 'Modify Physician', sub: 'Clean · ready to export' },
  manual: { label: 'Manual Entry', sub: 'Held for a processor' },
  special: { label: 'Special Approval Requested', sub: 'Escalated · awaiting sign-off' },
  denied: { label: 'Request Denied', sub: 'Denied · requester notified' },
  approved: { label: 'Request Approved', sub: 'Approved · ready to export' },
};

const STATUS_ORDER: RequestStatus[] = [
  'newreq',
  'duplicate',
  'modify',
  'manual',
  'special',
  'denied',
  'approved',
];

/**
 * Defensivo a propósito: si el backend agrega un código de status, parseResponse
 * ya avisa en consola y esto evita que la pantalla reviente con undefined.
 */
export function statusMeta(status: RequestStatus): StatusMeta {
  return META[status] ?? { label: status, sub: 'Status not recognized by this client' };
}

/** Los colores viven en tokens/colors.css como --status-{code}-{bg|fg|dot}. */
export function statusColors(status: RequestStatus) {
  return {
    bg: `var(--status-${status}-bg, var(--slate-100))`,
    fg: `var(--status-${status}-fg, var(--slate-600))`,
    dot: `var(--status-${status}-dot, var(--slate-400))`,
  };
}

export const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = STATUS_ORDER.map(
  (value) => ({ value, label: META[value].label }),
);

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...STATUS_OPTIONS,
];

export const PHYSICIAN_TYPE_LABEL: Record<string, string> = {
  f2f: 'F2F Only',
  primarySecondary: 'Primary/Secondary',
};
