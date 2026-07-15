import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { StatusBadge } from '../ui/StatusBadge';
import { EXPORTABLE_STATUSES, TRIGGER_STATUSES } from '../data/types';
import type { PhysicianRequest, RequestStatus } from '../data/types';

const EditIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
);

const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'newreq', label: 'New Request' },
  { value: 'duplicate', label: 'Duplicate Phy/NPI' },
  { value: 'modify', label: 'Modify Physician' },
  { value: 'manual', label: 'Manual Entry' },
  { value: 'special', label: 'Special Approval Requested' },
  { value: 'denied', label: 'Request Denied' },
  { value: 'approved', label: 'Request Approved' },
];

const PHYSICIAN_TYPE_LABEL: Record<string, string> = {
  f2f: 'F2F Only',
  primarySecondary: 'Primary/Secondary',
};

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: mono ? 'var(--fs-body)' : 'var(--fs-value-lg)', fontWeight: mono ? 400 : 500, color: 'var(--text-heading)' }}>{value || '—'}</div>
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
          <Card eyebrow="Patient & requester">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <KV label="Patient name" value={r.patientName} />
              <KV label="MRN" value={r.mrn} mono />
              <KV label="Patient status" value={r.patientStatus} />
              <KV label="Requester" value={r.requesterName} />
              <KV label="Requester email" value={r.requesterEmail} />
            </div>
          </Card>
          <Card eyebrow="Physician">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <KV label="First name" value={r.first} />
              <KV label="Last name" value={r.last} />
              <KV label="Degree" value={r.degree} />
              <KV label="Branch code" value={r.branch} mono />
              <KV label="NPI number" value={r.npi} mono />
              <KV label="Physician type" value={PHYSICIAN_TYPE_LABEL[r.physicianType] || '—'} />
              <KV label="VA/Tricare" value={r.vaTricare ? 'Yes' : 'No'} />
              <KV label="Pecos verified" value={r.pecosVerified ? 'Yes' : 'No'} />
              <KV label="License number" value={r.licenseNumber} />
              <KV label="License state" value={r.licenseState} />
              <KV label="License expiration" value={r.licenseExp} />
              <KV label="Specialty" value={r.specialty} />
              <KV label="Taxonomy" value={r.taxonomy} />
              <KV label="Physician group" value={r.physicianGroup} />
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
              <KV label="Admission coordinator" value={r.admissionCoordinator} />
              <KV label="Physician group" value={r.officePhysicianGroup} />
              <div style={{ gridColumn: '1 / -1' }}><KV label="Additional details" value={r.additionalDetails} /></div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Card eyebrow="Status">
            <Timeline request={r} exportable={exportable} />
          </Card>
          {TRIGGER_STATUSES.includes(r.status) && (
            <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-xl)', padding: '20px', display: 'flex', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-mono)', lineHeight: 'var(--lh-body)', color: 'var(--text-label)' }}>
                {'A response regarding this request will be sent to ' + r.requesterEmail}
              </p>
            </div>
          )}
          <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-xl)', padding: '20px', display: 'flex', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-mono)', lineHeight: 'var(--lh-body)', color: 'var(--text-label)' }}>
              {exportable
                ? 'New Request, Modify Physician, and Request Approved records are clean and included in the next export batch to HCHB.'
                : 'This request is held for review. Route it to New Request, Modify Physician, or Request Approved once resolved to include it in the export batch to HCHB.'}
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
  newreq:    { color: 'var(--status-newreq-dot)',    ring: 'var(--status-newreq-bg)',    label: 'New Request',                sub: 'Clean · ready to export' },
  modify:    { color: 'var(--status-modify-dot)',    ring: 'var(--status-modify-bg)',    label: 'Modify Physician',           sub: 'Clean · ready to export' },
  approved:  { color: 'var(--status-approved-dot)',  ring: 'var(--status-approved-bg)',  label: 'Request Approved',           sub: 'Approved · ready to export' },
  duplicate: { color: 'var(--status-duplicate-dot)', ring: 'var(--status-duplicate-bg)', label: 'Duplicate Phy/NPI',          sub: 'Possible duplicate · needs resolution' },
  manual:    { color: 'var(--status-manual-dot)',    ring: 'var(--status-manual-bg)',    label: 'Manual Entry',               sub: 'Held for a processor' },
  special:   { color: 'var(--status-special-dot)',   ring: 'var(--status-special-bg)',   label: 'Special Approval Requested', sub: 'Escalated · awaiting sign-off' },
  denied:    { color: 'var(--status-denied-dot)',    ring: 'var(--status-denied-bg)',    label: 'Request Denied',             sub: 'Denied · requester notified' },
};

function Timeline({ request, exportable }: { request: PhysicianRequest; exportable: boolean }) {
  const m = STATUS_META[request.status];
  return (
    <div>
      <Step color="var(--success-500)" title="Submitted" sub={`${request.created} · ${request.submitter}`} />
      <Step color={m.color} ring={m.ring} title={m.label} sub={m.sub} />
      <Step
        color={exportable ? 'var(--status-newreq-dot)' : '#fff'}
        mutedTitle={!exportable}
        title="Exported to HCHB"
        sub={exportable ? 'In the next export batch' : 'Once New Request / Modify Physician / Request Approved'}
        line={false}
      />
    </div>
  );
}
