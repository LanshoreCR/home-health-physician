import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { StatusBadge } from '../ui/StatusBadge';
import { EXPORTABLE_STATUSES } from '../data/types';
import type { PhysicianRequest, RequestStatus } from '../data/types';

const EditIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
);

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'modify', label: 'Modify/Add' },
  { value: 'manual', label: 'Manual Processing' },
  { value: 'notfound', label: 'Physician Not Found' },
  { value: 'special', label: 'Pending Special Approval' },
];

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: mono ? 'var(--fs-body)' : 'var(--fs-value-lg)', fontWeight: mono ? 400 : 500, color: 'var(--text-heading)' }}>{value}</div>
    </div>
  );
}

interface RequestDetailProps {
  request: PhysicianRequest;
  onSetStatus: (status: RequestStatus) => void;
  onEdit: () => void;
}

/**
 * RequestDetail — review view. Prominent status, grouped read-only data,
 * a status timeline, and the reviewer's Edit + status disposition controls.
 */
export function RequestDetail({ request, onSetStatus, onEdit }: RequestDetailProps) {
  const r = request;
  const exportable = EXPORTABLE_STATUSES.includes(r.status);
  return (
    <div style={{ background: 'var(--surface-page)', maxWidth: 'var(--page-max)', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px var(--page-gutter) 24px', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-card)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--fs-page-title)', color: 'var(--text-heading)', letterSpacing: 'var(--ls-tight)' }}>{r.first} {r.last}, {r.degree}</h1>
            <StatusBadge status={r.status} size="md" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
            <span>NPI <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>{r.npi}</span></span>
            <span style={{ color: 'var(--slate-300)' }}>·</span>
            <span>Branch <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>{r.branch}</span></span>
            <span style={{ color: 'var(--slate-300)' }}>·</span>
            <span>Created {r.created}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="secondary" size="lg" icon={EditIcon} onClick={onEdit}>Edit</Button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)' }}>Set status</span>
            <Select
              value={r.status}
              options={STATUS_OPTIONS}
              placeholder=""
              onChange={(e) => onSetStatus(e.target.value as RequestStatus)}
              style={{ minWidth: '220px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', padding: '28px var(--page-gutter) 36px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Card eyebrow="Physician">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <KV label="First name" value={r.first} />
              <KV label="Last name" value={r.last} />
              <KV label="Degree" value={r.degree} />
              <KV label="Branch code" value={r.branch} mono />
              <KV label="NPI number" value={r.npi} mono />
            </div>
          </Card>
          <Card eyebrow="Notifications">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <KV label="Preferred vital sign alerts" value={r.vitalAlerts} />
              <KV label="New order notification" value={r.orderNotif} />
            </div>
          </Card>
          <Card eyebrow="Physician's office">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}><KV label="Address" value={r.address} /></div>
              <KV label="City" value={r.city} />
              <KV label="State" value={r.state} />
              <KV label="Zip code" value={r.zip} mono />
              <KV label="Phone" value={r.phone} mono />
              <KV label="Fax" value={r.fax} mono />
              <KV label="Vital sign alerts to office" value={r.officeVital} />
              <KV label="New order notification to office" value={r.officeOrder} />
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Card eyebrow="Status">
            <Timeline request={r} exportable={exportable} />
          </Card>
          <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-xl)', padding: '20px', display: 'flex', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-mono)', lineHeight: 'var(--lh-body)', color: 'var(--text-label)' }}>
              {exportable
                ? 'New and Modify/Add requests are clean and included in the next export batch to HCHB.'
                : 'This request is held for review. Route it to New or Modify/Add once resolved to include it in the export batch to HCHB.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ color, ring, title, sub, mutedTitle, line = true }: {
  color: string;
  ring?: string;
  title: string;
  sub: string;
  mutedTitle?: boolean;
  line?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: color, border: color === '#fff' ? '2px solid var(--slate-300)' : 'none', boxShadow: ring ? `0 0 0 3px ${ring}` : 'none' }} />
        {line && <span style={{ width: '2px', flex: 1, background: 'var(--slate-200)' }} />}
      </div>
      <div style={{ paddingBottom: line ? '18px' : 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', fontWeight: 600, color: mutedTitle ? 'var(--text-faint)' : 'var(--text-heading)' }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-label)', color: mutedTitle ? 'var(--slate-300)' : 'var(--text-faint)' }}>{sub}</div>
      </div>
    </div>
  );
}

const STATUS_META: Record<RequestStatus, { color: string; ring: string; label: string; sub: string }> = {
  new:      { color: 'var(--status-new-dot)',      ring: 'var(--status-new-bg)',      label: 'New',                     sub: 'Clean · ready to export' },
  modify:   { color: 'var(--status-modify-dot)',   ring: 'var(--status-modify-bg)',   label: 'Modify/Add',              sub: 'Clean · ready to export' },
  manual:   { color: 'var(--status-manual-dot)',   ring: 'var(--status-manual-bg)',   label: 'Manual Processing',       sub: 'Held for a processor' },
  notfound: { color: 'var(--status-notfound-dot)', ring: 'var(--status-notfound-bg)', label: 'Physician Not Found',     sub: 'NPI unmatched · needs resolution' },
  special:  { color: 'var(--status-special-dot)',  ring: 'var(--status-special-bg)',  label: 'Pending Special Approval', sub: 'Escalated · awaiting sign-off' },
};

function Timeline({ request, exportable }: { request: PhysicianRequest; exportable: boolean }) {
  const m = STATUS_META[request.status];
  return (
    <div>
      <Step color="var(--success-500)" title="Submitted" sub={`${request.created} · ${request.submitter}`} />
      <Step color={m.color} ring={m.ring} title={m.label} sub={m.sub} />
      <Step
        color={exportable ? 'var(--status-new-dot)' : '#fff'}
        mutedTitle={!exportable}
        title="Exported to HCHB"
        sub={exportable ? 'In the next export batch' : 'Once clean (New / Modify/Add)'}
        line={false}
      />
    </div>
  );
}
