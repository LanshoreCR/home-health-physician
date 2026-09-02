import { useState, type CSSProperties } from 'react';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { StatusBadge } from '../ui/StatusBadge';
import { formatCreated } from '../api/dates';
import { useLabelFor, useStatusFilterOptions } from '../hooks/useLookups';
import { ALL, nextSort, useRequesterOptions, useVisibleRequests } from '../hooks/useListView';
import type { Sort, SortDir, SortKey } from '../hooks/useListView';
import type { PhysicianRequestListItem, StatusFilter } from '../data/types';

const DownloadIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
const PlusIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const SearchIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--slate-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);

const COLS = 'minmax(0,1.5fr) minmax(0,1fr) minmax(0,0.85fr) minmax(0,0.5fr) minmax(0,1.15fr) minmax(0,0.7fr) minmax(0,1.25fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.5fr) minmax(0,1.5fr) minmax(0,0.85fr)';

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'physician', label: 'Physician' },
  { key: 'npi', label: 'NPI' },
  { key: 'branch', label: 'Branch Code' },
  { key: 'degree', label: 'Degree' },
  { key: 'physicianType', label: 'Type' },
  { key: 'vaTricare', label: 'VA/Tricare' },
  { key: 'patientName', label: 'Patient' },
  { key: 'mrn', label: 'MRN' },
  { key: 'patientStatus', label: 'Patient Status' },
  { key: 'requesterName', label: 'Requester' },
  { key: 'status', label: 'Status' },
  { key: 'created', label: 'Created' },
];

const CELL: CSSProperties = { minWidth: 0, overflowWrap: 'anywhere' };

interface RequestsListProps {
  requests: PhysicianRequestListItem[];
  totalCount: number;
  exportableCount: number;
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  branchFilter: string;
  onBranchFilterChange: (value: string) => void;
  requesterFilter: string;
  onRequesterFilterChange: (value: string) => void;
  sort: Sort;
  onSortChange: (value: Sort) => void;
  branches: string[];
  onOpen: (id: number) => void;
  onNew: () => void;
  onExport: () => void;
  canCreate: boolean;
  canExport: boolean;
}

/**
 * RequestsList — portal home. Scannable table of physician requests with
 * status chips, working search + filters, sortable headers, and the New /
 * Export primary actions.
 */
export function RequestsList({
  requests, totalCount, exportableCount, loading, error,
  search, onSearchChange,
  statusFilter, onStatusFilterChange,
  branchFilter, onBranchFilterChange,
  requesterFilter, onRequesterFilterChange,
  sort, onSortChange,
  branches,
  onOpen, onNew, onExport,
  canCreate, canExport,
}: RequestsListProps) {
  const branchOptions = [{ value: ALL, label: 'All' }, ...branches.map((b) => ({ value: b, label: b }))];
  const statusOptions = useStatusFilterOptions();
  const requesterOptions = useRequesterOptions(requests, requesterFilter);
  const visible = useVisibleRequests(requests, requesterFilter, sort);

  /**
   * Con el filtro de Requester puesto el conteo del servidor deja de describir
   * lo que se ve, y exportableCount ya no se puede recalcular acá: la fila de
   * lista no trae exportedAt. Así que se muestra lo que sí es cierto.
   */
  const filteredByRequester = requesterFilter !== ALL;

  return (
    <div style={{ background: 'var(--surface-page)', maxWidth: 'var(--page-max)', margin: '0 auto' }}>
      <div style={{ padding: '28px var(--page-gutter) 36px' }}>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--fs-page-title)', color: 'var(--text-heading)', letterSpacing: 'var(--ls-tight)' }}>Physician requests</h1>
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
              {filteredByRequester
                ? `${visible.length} requests`
                : `${totalCount} requests · ${exportableCount} ready to export`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {canExport && <Button variant="secondary" icon={DownloadIcon} onClick={onExport}>Export to Excel</Button>}
            {canCreate && <Button variant="primary" icon={PlusIcon} onClick={onNew}>New Physician Request</Button>}
          </div>
        </header>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '340px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>{SearchIcon}</span>
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search name or NPI…"
              style={{ width: '100%', height: 'var(--control-h)', padding: '0 12px 0 36px', background: 'var(--surface-card)', border: '1px solid var(--border-field)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-body)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <FilterSelect label="Status" value={statusFilter} options={statusOptions} onChange={(v) => onStatusFilterChange(v as StatusFilter)} />
          <FilterSelect label="Branch" value={branchFilter} options={branchOptions} onChange={onBranchFilterChange} />
          <FilterSelect label="Requester" value={requesterFilter} options={requesterOptions} onChange={onRequesterFilterChange} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', minWidth: '1440px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: '16px', padding: '14px 24px', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-card)', fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
              {COLUMNS.map((column) => (
                <SortHeader
                  key={column.key}
                  label={column.label}
                  active={sort.key === column.key ? sort.dir : null}
                  onClick={() => onSortChange(nextSort(sort, column.key))}
                />
              ))}
            </div>
            {loading && <TableSkeleton />}
            {!loading && error && <TableNotice text={error} tone="error" />}
            {!loading && !error && visible.length === 0 && (
              <TableNotice text="No requests match your filters." />
            )}
            {!loading && !error && visible.map((r, i) => (
              <Row key={r.id} r={r} last={i === visible.length - 1} onOpen={onOpen} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SortHeader({ label, active, onClick }: {
  label: string;
  /** La dirección cuando esta columna manda el orden, null cuando no. */
  active: SortDir | null;
  onClick: () => void;
}) {
  return (
    <span
      onClick={onClick}
      aria-sort={active === null ? 'none' : active === 'asc' ? 'ascending' : 'descending'}
      style={{ ...CELL, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', userSelect: 'none', color: active === null ? 'inherit' : 'var(--text-label)' }}
    >
      {label}
      {active !== null && <SortCaret dir={active} />}
    </span>
  );
}

function SortCaret({ dir }: { dir: SortDir }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, transform: dir === 'asc' ? 'rotate(180deg)' : 'none' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px', height: 'var(--control-h)', padding: '0 12px', background: 'var(--surface-card)', border: '1px solid var(--border-field)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-body)' }}>
      <span style={{ color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, height: '100%', border: 'none', background: 'transparent', appearance: 'none', WebkitAppearance: 'none', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-body)', cursor: 'pointer', padding: 0, minWidth: 0, textOverflow: 'ellipsis' }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--slate-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
    </div>
  );
}

const SKELETON_ROWS = 8;
/** Un ancho por columna de COLUMNS, para que las filas fantasma no queden todas iguales. */
const SKELETON_WIDTHS = ['64%', '52%', '46%', '34%', '58%', '30%', '70%', '48%', '56%', '62%', '78%', '50%'];
const STATUS_COL = 10;

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ROWS }, (_, row) => (
        <div
          key={row}
          style={{ display: 'grid', gridTemplateColumns: COLS, gap: '16px', padding: '18px 24px', alignItems: 'center', borderBottom: row === SKELETON_ROWS - 1 ? 'none' : '1px solid var(--border-divider)' }}
        >
          {SKELETON_WIDTHS.map((w, col) => (
            col === STATUS_COL
              ? <Skeleton key={col} w={w} h={24} radius="var(--radius-pill)" />
              : <Skeleton key={col} w={w} />
          ))}
        </div>
      ))}
    </>
  );
}

function TableNotice({ text, tone }: { text: string; tone?: 'error' }) {
  return (
    <div style={{ padding: '40px 24px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: tone === 'error' ? 'var(--danger-600)' : 'var(--text-faint)' }}>{text}</div>
  );
}

function Row({ r, last, onOpen }: { r: PhysicianRequestListItem; last: boolean; onOpen: (id: number) => void }) {
  const [hover, setHover] = useState(false);
  const labelFor = useLabelFor();
  return (
    <div
      onClick={() => onOpen(r.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'grid', gridTemplateColumns: COLS, gap: '16px', padding: '18px 24px', alignItems: 'center', borderBottom: last ? 'none' : '1px solid var(--border-divider)', background: hover ? '#f8fbff' : 'transparent', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-body)', cursor: 'pointer' }}
    >
      <span style={{ ...CELL, fontWeight: 600 }}>{r.first} {r.last}</span>
      <span style={{ ...CELL, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono)', color: 'var(--text-label)' }}>{r.npi}</span>
      <span style={{ ...CELL, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono)', color: 'var(--text-label)' }}>{r.branch}</span>
      <span style={{ ...CELL, color: 'var(--text-label)' }}>{labelFor('degrees', r.degree)}</span>
      <span style={CELL}>{labelFor('physicianTypes', r.physicianType) || '—'}</span>
      <span style={CELL}>{r.vaTricare ? 'Yes' : '—'}</span>
      <span style={CELL}>{r.patientName}</span>
      <span style={{ ...CELL, fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-mono)', color: 'var(--text-label)' }}>{r.mrn}</span>
      <span style={CELL}>{labelFor('patientStatuses', r.patientStatus)}</span>
      <span style={CELL}>{r.requesterName}</span>
      <StatusBadge status={r.status} label={labelFor('requestStatuses', r.status)} style={{ minWidth: 0, whiteSpace: 'normal' }} />
      <span style={{ ...CELL, color: 'var(--text-muted)' }}>{formatCreated(r.created)}</span>
    </div>
  );
}
