import { type ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Skeleton } from '../ui/Skeleton';
import { StatusBadge } from '../ui/StatusBadge';
import { EXPORTABLE_STATUSES, TRIGGER_STATUSES } from '../data/types';
import { STATUS_OPTIONS, statusColors, statusMeta } from '../data/labels';
import { useLabelFor } from '../hooks/useLookups';
import type { PhysicianRequest, RequestStatus } from '../data/types';

const EditIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
);
const TrashIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
const InfoIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
);
const WarnIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: mono ? 'var(--fs-body)' : 'var(--fs-value-lg)', fontWeight: mono ? 400 : 500, color: 'var(--text-heading)' }}>{value || '—'}</div>
    </div>
  );
}

function Banner({ icon, children, tone }: { icon: ReactNode; children: ReactNode; tone?: 'warn' }) {
  return (
    <div style={{ background: tone === 'warn' ? 'var(--danger-50)' : 'var(--surface-subtle)', border: `1px solid ${tone === 'warn' ? 'var(--danger-border)' : 'var(--border-card)'}`, borderRadius: 'var(--radius-xl)', padding: '20px', display: 'flex', gap: '10px' }}>
      {icon}
      <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-mono)', lineHeight: 'var(--lh-body)', color: 'var(--text-label)' }}>
        {children}
      </p>
    </div>
  );
}

interface RequestDetailProps {
  request: PhysicianRequest;
  statusPending: boolean;
  emailFailed: boolean;
  onSetStatus: (status: RequestStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * RequestDetail — review view. Prominent status, grouped read-only data,
 * a status timeline, and the reviewer's Edit + status disposition controls.
 */
export function RequestDetail({ request, statusPending, emailFailed, onSetStatus, onEdit, onDelete }: RequestDetailProps) {
  const r = request;
  const labelFor = useLabelFor();
  const exportable = EXPORTABLE_STATUSES.includes(r.status);
  const notifies = TRIGGER_STATUSES.includes(r.status);
  return (
    <div style={{ background: 'var(--surface-page)', maxWidth: 'var(--page-max)', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px var(--page-gutter) 24px', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-card)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--fs-page-title)', color: 'var(--text-heading)', letterSpacing: 'var(--ls-tight)' }}>{r.first} {r.last}, {labelFor('degrees', r.degree)}</h1>
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
          <Button variant="danger" size="lg" icon={TrashIcon} onClick={onDelete}>Delete</Button>
          <Button variant="secondary" size="lg" icon={EditIcon} onClick={onEdit}>Edit</Button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)' }}>{statusPending ? 'Saving status…' : 'Set status'}</span>
            <Select
              value={r.status}
              options={STATUS_OPTIONS}
              placeholder=""
              disabled={statusPending}
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
              <KV label="Patient status" value={labelFor('patientStatuses', r.patientStatus)} />
              <KV label="Requester" value={r.requesterName} />
              <KV label="Requester email" value={r.requesterEmail} />
            </div>
          </Card>
          <Card eyebrow="Physician">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <KV label="First name" value={r.first} />
              <KV label="Last name" value={r.last} />
              <KV label="Degree" value={labelFor('degrees', r.degree)} />
              <KV label="Branch code" value={r.branch} mono />
              <KV label="NPI number" value={r.npi} mono />
              <KV label="Physician type" value={labelFor('physicianTypes', r.physicianType)} />
              <KV label="VA/Tricare" value={r.vaTricare ? 'Yes' : 'No'} />
              <KV label="Pecos verified" value={r.pecosVerified ? 'Yes' : 'No'} />
              <KV label="License number" value={r.licenseNumber} />
              <KV label="License state" value={labelFor('states', r.licenseState)} />
              <KV label="License expiration" value={r.licenseExp} />
              <KV label="Specialty" value={r.specialty} />
              <KV label="Taxonomy" value={r.taxonomy} />
              <KV label="Physician group" value={r.physicianGroup} />
            </div>
          </Card>
          <Card eyebrow="Notifications">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <KV label="Preferred vital sign alerts" value={labelFor('vitalAlertMethods', r.vitalAlerts)} />
              <KV label="New order notification" value={labelFor('orderNotifMethods', r.orderNotif)} />
            </div>
          </Card>
          <Card eyebrow="Physician's office">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}><KV label="Address" value={r.address} /></div>
              <KV label="City" value={r.city} />
              <KV label="State" value={labelFor('states', r.state)} />
              <KV label="Zip code" value={r.zip} mono />
              <KV label="Phone" value={r.phone} mono />
              <KV label="Fax" value={r.fax} mono />
              <KV label="Vital sign alerts to office" value={labelFor('vitalAlertMethods', r.officeVital)} />
              <KV label="New order notification to office" value={labelFor('orderNotifMethods', r.officeOrder)} />
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

          {emailFailed && (
            <Banner icon={WarnIcon} tone="warn">
              {`The status was saved, but the notification email to ${r.requesterEmail} could not be sent. Follow up manually.`}
            </Banner>
          )}
          {notifies && !emailFailed && (
            <Banner icon={InfoIcon}>
              {`A response regarding this request will be sent to ${r.requesterEmail}`}
            </Banner>
          )}

          <Banner icon={InfoIcon}>
            {exportable
              ? 'New Request, Modify Physician, and Request Approved records are clean and included in the next export batch to HCHB.'
              : 'This request is held for review. Route it to New Request, Modify Physician, or Request Approved once resolved to include it in the export batch to HCHB.'}
          </Banner>
        </div>
      </div>
    </div>
  );
}

function KVSkeleton() {
  return (
    <div>
      <Skeleton w="58%" h={11} style={{ marginBottom: '8px' }} />
      <Skeleton w="82%" h={16} />
    </div>
  );
}

function CardSkeleton({ fields, cols = 3 }: { fields: number; cols?: number }) {
  return (
    <Card>
      <Skeleton w={140} h={11} style={{ marginBottom: '18px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '20px' }}>
        {Array.from({ length: fields }, (_, i) => <KVSkeleton key={i} />)}
      </div>
    </Card>
  );
}

/** Calcado del layout de RequestDetail para que no haya salto al llegar los datos. */
export function DetailSkeleton() {
  return (
    <div style={{ background: 'var(--surface-page)', maxWidth: 'var(--page-max)', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px var(--page-gutter) 24px', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-card)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <Skeleton w={280} h={28} radius="var(--radius-md)" />
            <Skeleton w={120} h={26} radius="var(--radius-pill)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <Skeleton w={130} h={14} />
            <Skeleton w={150} h={14} />
            <Skeleton w={140} h={14} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Skeleton w={104} h={42} radius="var(--radius-md)" />
          <Skeleton w={90} h={42} radius="var(--radius-md)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Skeleton w={64} h={11} />
            <Skeleton w={220} h={44} radius="var(--radius-md)" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', padding: '28px var(--page-gutter) 36px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <CardSkeleton fields={5} />
          <CardSkeleton fields={14} />
          <CardSkeleton fields={2} cols={2} />
          <CardSkeleton fields={11} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Card>
            <Skeleton w={80} h={11} style={{ marginBottom: '18px' }} />
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: i === 2 ? 0 : '18px' }}>
                <Skeleton w={11} h={11} radius="50%" style={{ marginTop: '4px' }} />
                <div style={{ flex: 1 }}>
                  <Skeleton w="52%" h={14} style={{ marginBottom: '6px' }} />
                  <Skeleton w="74%" h={11} />
                </div>
              </div>
            ))}
          </Card>
          <Skeleton h={104} radius="var(--radius-xl)" />
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

function Timeline({ request, exportable }: { request: PhysicianRequest; exportable: boolean }) {
  const meta = statusMeta(request.status);
  const colors = statusColors(request.status);
  const exported = request.exportedAt !== null;
  return (
    <div>
      <Step color="var(--success-500)" title="Submitted" sub={`${request.created} · ${request.submitter}`} />
      <Step color={colors.dot} ring={colors.bg} title={meta.label} sub={meta.sub} />
      <Step
        color={exported || exportable ? 'var(--status-newreq-dot)' : '#fff'}
        mutedTitle={!exported && !exportable}
        title="Exported to HCHB"
        sub={exportSub(exported, exportable)}
        line={false}
      />
    </div>
  );
}

function exportSub(exported: boolean, exportable: boolean): string {
  if (exported) return 'Already sent to HCHB';
  if (exportable) return 'In the next export batch';
  return 'Once New Request / Modify Physician / Request Approved';
}
