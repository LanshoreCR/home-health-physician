import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import type { PhysicianRequest } from '../data/types';

const EditIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
);
const XIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const CheckIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

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
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
}

/**
 * RequestDetail — review view. Prominent status, grouped read-only data,
 * a status timeline, and the reviewer's Edit / Reject / Approve actions.
 */
export function RequestDetail({ request, onApprove, onReject, onEdit }: RequestDetailProps) {
  const r = request;
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" size="lg" icon={EditIcon} onClick={onEdit}>Edit</Button>
          <Button variant="danger" size="lg" icon={XIcon} onClick={onReject}>Reject</Button>
          <Button variant="success" size="lg" icon={CheckIcon} onClick={onApprove}>Approve</Button>
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
            <Timeline created={r.created} submitter={r.submitter} />
          </Card>
          <div style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-xl)', padding: '20px', display: 'flex', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-mono)', lineHeight: 'var(--lh-body)', color: 'var(--text-label)' }}>Review each field for completeness and format. Approving moves this request into the next export batch to HCHB.</p>
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

function Timeline({ created, submitter }: { created: string; submitter: string }) {
  return (
    <div>
      <Step color="var(--success-500)" title="Submitted" sub={`${created} · ${submitter}`} />
      <Step color="var(--warning-500)" ring="var(--status-pending-bg)" title="Pending Review" sub="Awaiting your decision" />
      <Step color="#fff" mutedTitle title="Approved / Rejected" sub="Then exported to HCHB" line={false} />
    </div>
  );
}
