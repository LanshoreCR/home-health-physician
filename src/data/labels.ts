/**
 * Lo que el catálogo del backend no sabe. Los labels de status salen de
 * requestStatuses en /lookups; acá quedan el subtítulo del timeline y los
 * colores, que son decisiones de esta UI.
 */

const SUB: Record<string, string> = {
  newreq: 'Clean · ready to export',
  duplicate: 'Possible duplicate · needs resolution',
  modify: 'Clean · ready to export',
  manual: 'Held for a processor',
  special: 'Escalated · awaiting sign-off',
  denied: 'Denied · requester notified',
  approved: 'Approved · ready to export',
  imported: 'In HCHB · out of the export batch',
};

export function statusSub(status: string): string {
  return SUB[status] ?? 'Status not recognized by this client';
}

/** Los colores viven en tokens/colors.css como --status-{code}-{bg|fg|dot}. */
export function statusColors(status: string) {
  return {
    bg: `var(--status-${status}-bg, var(--slate-100))`,
    fg: `var(--status-${status}-fg, var(--slate-600))`,
    dot: `var(--status-${status}-dot, var(--slate-400))`,
  };
}
