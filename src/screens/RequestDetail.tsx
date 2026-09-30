import { useEffect, useState, type ReactNode } from 'react';
import { FormProvider } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Skeleton } from '../ui/Skeleton';
import { StatusBadge } from '../ui/StatusBadge';
import { formatCreated } from '../api/dates';
import { EXPORTABLE_STATUSES } from '../data/types';
// import { TRIGGER_STATUSES } from '../data/types';
import { statusColors, statusSub } from '../data/labels';
import { useExportableLabels, useLabelFor, useLookups, useStatusOptions } from '../hooks/useLookups';
import { toDraft } from '../api/schemas';
import type { PhysicianRequest, RequestDraft, RequestStatus } from '../data/types';
import { DetailField } from './DetailField';
import { FormFooter } from './RequestFields';
import { useRequestForm } from './requestDraft';

const EditIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
);
const TrashIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
const InfoIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
);
// Email deshabilitado hasta que existan las credenciales de Microsoft Graph.
// const WarnIcon = (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
// );

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

/** La edición vive en el detalle: App solo guarda y reporta el resultado. */
export interface DetailEditSession {
  active: boolean;
  saving: boolean;
  error: string | null;
  /** Errores por campo devueltos por el 400 del backend, ya camelCaseados. */
  fieldErrors: Record<string, string[]>;
  onStart: () => void;
  onCancel: () => void;
  onSave: (values: RequestDraft, status: RequestStatus) => void;
}

interface RequestDetailProps {
  request: PhysicianRequest;
  statusPending: boolean;
  // emailFailed: boolean;
  onSetStatus: (status: RequestStatus) => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
  canSetStatus: boolean;
  edit: DetailEditSession;
}

function statusCaption(editing: boolean, statusPending: boolean): string {
  if (editing) return 'Status';
  if (statusPending) return 'Saving status…';
  return 'Set status';
}

/**
 * RequestDetail — review view. Prominent status, grouped data, a status
 * timeline, and the Edit + status disposition controls. Edit turns the same
 * cards into the form; a reviewer's status change rides along on Save.
 */
export function RequestDetail({
  request, statusPending, onSetStatus, onDelete,
  canEdit, canDelete, canSetStatus, edit,
}: RequestDetailProps) {
  const r = request;
  const { lookups } = useLookups();
  const labelFor = useLabelFor();
  const statusOptions = useStatusOptions(r.status);
  const exportableLabels = useExportableLabels();
  const exportable = EXPORTABLE_STATUSES.includes(r.status);
  // const notifies = TRIGGER_STATUSES.includes(r.status);
  const form = useRequestForm(toDraft(r), edit.fieldErrors);
  const { reset, handleSubmit } = form;
  const [draftStatus, setDraftStatus] = useState<RequestStatus>(r.status);
  const editing = edit.active;

  useEffect(() => {
    if (editing) return;
    reset(toDraft(r));
    setDraftStatus(r.status);
  }, [editing, r, reset]);

  const pickStatus = (status: RequestStatus) => {
    if (editing) return setDraftStatus(status);
    onSetStatus(status);
  };

  return (
    <FormProvider {...form}>
      <div style={{ background: 'var(--surface-page)', maxWidth: 'var(--page-max)', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px var(--page-gutter) 24px', background: 'var(--surface-card)', borderBottom: '1px solid var(--border-card)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <h1 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--fs-page-title)', color: 'var(--text-heading)', letterSpacing: 'var(--ls-tight)' }}>{r.first} {r.last}, {labelFor('degrees', r.degree)}</h1>
              <StatusBadge status={r.status} size="md" label={labelFor('requestStatuses', r.status)} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: '18px', rowGap: '4px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
              <span>NPI <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>{r.npi}</span></span>
              <span style={{ color: 'var(--slate-300)' }}>·</span>
              <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>Branch <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>{r.branch}</span></span>
              <span style={{ color: 'var(--slate-300)' }}>·</span>
              <span>Created {formatCreated(r.created)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            {!editing && canDelete && <Button variant="danger" size="lg" icon={TrashIcon} onClick={onDelete}>Delete</Button>}
            {!editing && canEdit && <Button variant="secondary" size="lg" icon={EditIcon} onClick={edit.onStart} disabled={!lookups}>Edit</Button>}
            {canSetStatus && <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '-1px' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)', lineHeight: 1.2 }}>{statusCaption(editing, statusPending)}</span>
              <Select
                value={editing ? draftStatus : r.status}
                options={statusOptions}
                placeholder=""
                disabled={statusPending || edit.saving || !lookups}
                onChange={(e) => pickStatus(e.target.value as RequestStatus)}
                style={{ minWidth: '220px' }}
              />
            </div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', padding: '28px var(--page-gutter) 36px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Card eyebrow="Patient & requester">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <DetailField editing={editing} name="patientName" label="Patient name" required />
                <DetailField editing={editing} name="mrn" label="MRN" kind="alphanumeric" required />
                <DetailField editing={editing} name="patientStatus" label="Patient status" kind="catalog" catalog="patientStatuses" required />
                <DetailField editing={editing} name="requesterName" label="Requester" required />
                <DetailField editing={editing} name="requesterEmail" label="Requester email" kind="email" required />
                <DetailField editing={editing} name="requestedSource" label="Requested source" kind="catalog" catalog="requestedSources" required />
              </div>
            </Card>
            <Card eyebrow="Physician">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <DetailField editing={editing} name="first" label="First name" required />
                <DetailField editing={editing} name="last" label="Last name" required />
                <DetailField editing={editing} name="degree" label="Degree" kind="catalog" catalog="degrees" required />
                <DetailField editing={editing} name="branch" label="Branch code" kind="mono" required />
                <DetailField editing={editing} name="npi" label="NPI number" kind="mono" required />
                <DetailField editing={editing} name="physicianType" label="Physician type" kind="catalog" catalog="physicianTypes" required />
                <DetailField editing={editing} name="vaTricare" label="VA/Tricare" kind="yesNo" />
                <DetailField editing={editing} name="pecosVerified" label="Pecos verified" kind="yesNo" />
                <DetailField editing={editing} name="licenseNumber" label="License number" />
                <DetailField editing={editing} name="licenseState" label="License state" kind="catalog" catalog="states" />
                <DetailField editing={editing} name="licenseExp" label="License expiration" kind="date" />
                <DetailField editing={editing} name="specialty" label="Specialty" />
                <DetailField editing={editing} name="taxonomy" label="Taxonomy" />
                <DetailField editing={editing} name="physicianGroup" label="Physician group" />
              </div>
            </Card>
            <Card eyebrow="Notifications">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <DetailField editing={editing} name="vitalAlerts" label="Preferred vital sign alerts" kind="catalog" catalog="vitalAlertMethods" required />
                <DetailField editing={editing} name="orderNotif" label="New order notification" kind="catalog" catalog="orderNotifMethods" required />
              </div>
            </Card>
            <Card eyebrow="Physician's office">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <DetailField editing={editing} name="address" label="Address" wide required />
                <DetailField editing={editing} name="city" label="City" required />
                <DetailField editing={editing} name="state" label="State" kind="catalog" catalog="states" required />
                <DetailField editing={editing} name="zip" label="Zip code" kind="mono" required />
                <DetailField editing={editing} name="phone" label="Phone" kind="phone" required />
                <DetailField editing={editing} name="fax" label="Fax" kind="phone" required />
                <DetailField editing={editing} name="officeVital" label="Vital sign alerts to office" kind="catalog" catalog="vitalAlertMethods" />
                <DetailField editing={editing} name="officeOrder" label="New order notification to office" kind="catalog" catalog="orderNotifMethods" />
                <DetailField editing={editing} name="admissionCoordinator" label="Admission coordinator" />
                <DetailField editing={editing} name="officePhysicianGroup" label="Physician group" />
                <DetailField editing={editing} name="additionalDetails" label="Additional details" kind="longText" wide />
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Card eyebrow="Status">
              <Timeline request={r} exportable={exportable} />
            </Card>

            {/* Email deshabilitado hasta que existan las credenciales de Microsoft Graph.
            {emailFailed && (
              <Banner icon={WarnIcon} tone="warn">
                {`The status was saved, but the notification email to ${r.requesterEmail} could not be sent. Follow up manually.`}
              </Banner>
            )}
            {notifies && !emailFailed && (
              <Banner icon={InfoIcon}>
                {`A response regarding this request will be sent to ${r.requesterEmail}`}
              </Banner>
            )} */}

            <Banner icon={InfoIcon}>
              {exportable
                ? `${exportableLabels('and')} records are clean and included in the next export batch to HCHB.`
                : `This request is held for review. Route it to ${exportableLabels('or')} once resolved to include it in the export batch to HCHB.`}
            </Banner>
          </div>
        </div>

        {editing && (
          <FormFooter
            submitLabel="Save changes"
            submitting={edit.saving}
            error={edit.error}
            onCancel={edit.onCancel}
            onSubmit={handleSubmit((values) => edit.onSave(values, draftStatus))}
          />
        )}
      </div>
    </FormProvider>
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
  const labelFor = useLabelFor();
  const exportableLabels = useExportableLabels();
  const colors = statusColors(request.status);
  const exported = request.exportedAt !== null;
  return (
    <div>
      <Step color="var(--success-500)" title="Submitted" sub={`${formatCreated(request.created)} · ${request.submitter}`} />
      <Step color={colors.dot} ring={colors.bg} title={labelFor('requestStatuses', request.status)} sub={statusSub(request.status)} />
      <Step
        color={exported || exportable ? 'var(--status-newreq-dot)' : '#fff'}
        mutedTitle={!exported && !exportable}
        title="Exported to HCHB"
        sub={exportSub(exported, exportable, exportableLabels('or'))}
        line={false}
      />
    </div>
  );
}

function exportSub(exported: boolean, exportable: boolean, exportableLabel: string): string {
  if (exported) return 'Already sent to HCHB';
  if (exportable) return 'In the next export batch';
  return `Once ${exportableLabel}`;
}
