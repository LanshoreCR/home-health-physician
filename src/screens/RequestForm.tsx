import { useState, type ChangeEvent, type ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { useLookups } from '../hooks/useLookups';
import { toOptions, validateDraft } from '../api/schemas';
import { PHYSICIAN_TYPE_LABEL } from '../data/labels';
import type { RequestDraft } from '../data/types';

const EMPTY: RequestDraft = {
  patientName: '', mrn: '', patientStatus: '', requesterName: '', requesterEmail: '',
  first: '', last: '', npi: '', degree: '', physicianType: '',
  vaTricare: false, pecosVerified: false,
  licenseNumber: '', licenseState: '', licenseExp: '', specialty: '', taxonomy: '', physicianGroup: '',
  vitalAlerts: '', orderNotif: '',
  branch: '', address: '', city: '', state: '', zip: '', phone: '', fax: '',
  officeVital: '', officeOrder: '', officePhysicianGroup: '', admissionCoordinator: '', additionalDetails: '',
};

type EditableKey = Exclude<keyof RequestDraft, 'vaTricare' | 'pecosVerified'>;
type OfficeKey = 'officeVital' | 'officeOrder' | 'officePhysicianGroup';

const MIRRORS: { source: EditableKey; office: OfficeKey }[] = [
  { source: 'vitalAlerts', office: 'officeVital' },
  { source: 'orderNotif', office: 'officeOrder' },
  { source: 'physicianGroup', office: 'officePhysicianGroup' },
];

function formatPhone(raw: string): string {
  const d = raw.replace(/[^0-9]/g, '').slice(0, 10);
  const a = d.slice(0, 3), b = d.slice(3, 6), c = d.slice(6, 10);
  if (d.length > 6) return a + '-' + b + '-' + c;
  if (d.length > 3) return a + '-' + b;
  return a;
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '12px', margin: '6px 0 2px' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', fontWeight: 600, letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ flex: 1, height: '1px', background: 'var(--border-divider)' }} />
    </div>
  );
}

function ErrorHint({ text }: { text: string }) {
  return <span style={{ color: 'var(--text-required)' }}>{text}</span>;
}

interface RequestFormProps {
  mode: 'create' | 'edit';
  values?: Partial<RequestDraft>;
  submitting: boolean;
  error: string | null;
  /** Errores por campo devueltos por el 400 del backend, ya camelCaseados. */
  fieldErrors: Record<string, string[]>;
  onCancel: () => void;
  onSubmit: (values: RequestDraft) => void;
}

/**
 * RequestForm — create / edit a physician request. Three sectioned cards
 * (Patient & requester, Physician, Office) and a sticky save/submit footer.
 * Office fields auto-populate from their physician-side source until edited.
 * La validación es el mismo saveRequestSchema que se usa antes de mandar el
 * body, así que el cliente y el 400 del servidor hablan el mismo idioma.
 */
export function RequestForm({ mode, values, submitting, error, fieldErrors, onCancel, onSubmit }: RequestFormProps) {
  const { lookups, error: lookupsError, retry } = useLookups();
  const [form, setForm] = useState<RequestDraft>({ ...EMPTY, ...values });
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(
    () => new Set(mode === 'edit' ? ['officeVital', 'officeOrder', 'officePhysicianGroup'] : []),
  );

  const validation = validateDraft(form);
  const errors: Record<string, string[]> = {
    ...(attempted ? validation.fieldErrors : {}),
    ...fieldErrors,
  };
  const errorFor = (key: string): string | undefined => errors[key]?.[0];
  const pendingCount = Object.keys(validation.fieldErrors).length;

  const hintFor = (key: string, fallback?: ReactNode): ReactNode => {
    const message = errorFor(key);
    if (message) return <ErrorHint text={message} />;
    return fallback;
  };
  const invalidFor = (key: string) => Boolean(errorFor(key));

  const update = (key: EditableKey) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setForm((f) => {
      const next: RequestDraft = { ...f, [key]: value };
      MIRRORS.forEach(({ source, office }) => {
        if (source === key && !touched.has(office)) next[office] = value;
      });
      return next;
    });
  };

  const updateOffice = (key: OfficeKey) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setTouched((t) => new Set(t).add(key));
    setForm((f) => ({ ...f, [key]: value }));
  };

  const updatePhone = (key: 'phone' | 'fax') => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: formatPhone(e.target.value) }));

  const toggle = (key: 'vaTricare' | 'pecosVerified') => (checked: boolean) =>
    setForm((f) => ({ ...f, [key]: checked }));

  const togglePhysicianType = (type: 'f2f' | 'primarySecondary') => (checked: boolean) =>
    setForm((f) => ({ ...f, physicianType: checked ? type : '' }));

  const handleSubmit = () => {
    setAttempted(true);
    if (!validation.ok) return;
    onSubmit(form);
  };

  if (lookupsError) {
    return (
      <Centered>
        <div style={{ color: 'var(--danger-600)', marginBottom: '12px' }}>{lookupsError}</div>
        <Button variant="secondary" onClick={retry}>Retry</Button>
      </Centered>
    );
  }

  if (!lookups) return <Centered>Loading form…</Centered>;

  return (
    <div style={{ background: 'var(--surface-page)', position: 'relative', maxWidth: 'var(--page-max)', margin: '0 auto' }}>
      <div style={{ padding: '28px var(--page-gutter) 0' }}>
        <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--fs-form-title)', color: 'var(--text-heading)', letterSpacing: 'var(--ls-tight)' }}>{mode === 'edit' ? 'Edit physician request' : 'New physician request'}</h1>
        <p style={{ margin: '0 0 26px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>Complete all required fields. The whole template must be filled before you can submit.</p>

        <Card step={1} title="Patient & requester" style={{ marginBottom: 'var(--section-gap)' }}>
          <div className="form-grid">
            <Field label="Patient name" required hint={hintFor('patientName')}><Input value={form.patientName} onChange={update('patientName')} invalid={invalidFor('patientName')} /></Field>
            <Field label="Medical record number" required hint={hintFor('mrn')}><Input mono value={form.mrn} onChange={update('mrn')} invalid={invalidFor('mrn')} /></Field>
            <Field label="Patient episode status" required hint={hintFor('patientStatus')}><Select value={form.patientStatus} options={toOptions(lookups.patientStatuses)} onChange={update('patientStatus')} invalid={invalidFor('patientStatus')} /></Field>
            <Field label="Requester name" required hint={hintFor('requesterName')}><Input value={form.requesterName} onChange={update('requesterName')} invalid={invalidFor('requesterName')} /></Field>
            <Field label="Requester email" required hint={hintFor('requesterEmail')}><Input type="email" value={form.requesterEmail} onChange={update('requesterEmail')} invalid={invalidFor('requesterEmail')} /></Field>
          </div>
        </Card>

        <Card step={2} title="Physician" style={{ marginBottom: 'var(--section-gap)' }}>
          <div className="form-grid">
            <Field label="First name" required hint={hintFor('first')}><Input value={form.first} onChange={update('first')} invalid={invalidFor('first')} /></Field>
            <Field label="Last name" required hint={hintFor('last')}><Input value={form.last} onChange={update('last')} invalid={invalidFor('last')} /></Field>
            <Field label="Degree" required hint={hintFor('degree', 'MD · DO · DPM · NP · PA')}><Select value={form.degree} options={toOptions(lookups.degrees)} onChange={update('degree')} invalid={invalidFor('degree')} /></Field>
            <Field label="NPI number" required hint={hintFor('npi', '10-digit National Provider Identifier')}><Input mono value={form.npi} onChange={update('npi')} invalid={invalidFor('npi')} /></Field>
            <Field label="Preferred method of vital sign alerts" required hint={hintFor('vitalAlerts', 'Phone · Fax · Email · Web')}><Select value={form.vitalAlerts} options={toOptions(lookups.vitalAlertMethods)} onChange={update('vitalAlerts')} invalid={invalidFor('vitalAlerts')} /></Field>
            <Field label="Method of new order notification" required hint={hintFor('orderNotif', 'F-Fax · F-Delivery · F-Paper · F-Circle · Email · Website · Interface')}><Select value={form.orderNotif} options={toOptions(lookups.orderNotifMethods)} onChange={update('orderNotif')} invalid={invalidFor('orderNotif')} /></Field>

            <Field label="Physician type" required style={{ gridColumn: '1 / -1' }} hint={hintFor('physicianType', 'Choose one')}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 48px', alignItems: 'center' }}>
                <Checkbox label={PHYSICIAN_TYPE_LABEL.f2f} checked={form.physicianType === 'f2f'} onChange={togglePhysicianType('f2f')} />
                <Checkbox label={PHYSICIAN_TYPE_LABEL.primarySecondary} checked={form.physicianType === 'primarySecondary'} onChange={togglePhysicianType('primarySecondary')} />
              </div>
            </Field>

            <Field label="Coverage & verification" required style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 48px', alignItems: 'center' }}>
                <Checkbox label="VA/Tricare" checked={form.vaTricare} onChange={toggle('vaTricare')} />
                <Checkbox label="Pecos Verified" checked={form.pecosVerified} onChange={toggle('pecosVerified')} />
              </div>
            </Field>

            <SectionDivider label="Optional" />

            <Field label="License number" hint={hintFor('licenseNumber')}><Input value={form.licenseNumber} onChange={update('licenseNumber')} invalid={invalidFor('licenseNumber')} /></Field>
            <Field label="License state" hint={hintFor('licenseState')}><Select value={form.licenseState} options={toOptions(lookups.states)} onChange={update('licenseState')} invalid={invalidFor('licenseState')} /></Field>
            <Field label="License expiration date" hint={hintFor('licenseExp')}><Input type="date" value={form.licenseExp} onChange={update('licenseExp')} invalid={invalidFor('licenseExp')} /></Field>
            <Field label="Specialty" hint={hintFor('specialty')}><Input value={form.specialty} onChange={update('specialty')} invalid={invalidFor('specialty')} /></Field>
            <Field label="Taxonomy" hint={hintFor('taxonomy', 'Defaults to None on import if blank')}><Input value={form.taxonomy} onChange={update('taxonomy')} invalid={invalidFor('taxonomy')} /></Field>
            <Field label="Physician group" hint={hintFor('physicianGroup', 'Defaults to None on import if blank')}><Input value={form.physicianGroup} onChange={update('physicianGroup')} invalid={invalidFor('physicianGroup')} /></Field>
          </div>
        </Card>

        <Card step={3} title="Physician's office details" style={{ marginBottom: 'var(--section-gap)' }}>
          <div className="form-grid">
            <Field label="Address" required style={{ gridColumn: '1 / -1' }} hint={hintFor('address')}><Input value={form.address} onChange={update('address')} invalid={invalidFor('address')} /></Field>
            <Field label="City" required hint={hintFor('city')}><Input value={form.city} onChange={update('city')} invalid={invalidFor('city')} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <Field label="State" required hint={hintFor('state')}><Select value={form.state} options={toOptions(lookups.states)} onChange={update('state')} invalid={invalidFor('state')} /></Field>
              <Field label="Zip code" required hint={hintFor('zip')}><Input mono value={form.zip} onChange={update('zip')} invalid={invalidFor('zip')} /></Field>
            </div>
            <Field label="Phone" required hint={hintFor('phone')}><Input mono value={form.phone} onChange={updatePhone('phone')} invalid={invalidFor('phone')} /></Field>
            <Field label="Fax" required hint={hintFor('fax')}><Input mono value={form.fax} onChange={updatePhone('fax')} invalid={invalidFor('fax')} /></Field>
            <Field label="Branch code" required hint={hintFor('branch')}><Input mono value={form.branch} onChange={update('branch')} invalid={invalidFor('branch')} /></Field>

            <SectionDivider label="Optional" />

            <Field label="Admission coordinator" hint={hintFor('admissionCoordinator')}><Input value={form.admissionCoordinator} onChange={update('admissionCoordinator')} invalid={invalidFor('admissionCoordinator')} /></Field>
            <Field label="Vital sign alerts to office" hint={hintFor('officeVital')}><Select value={form.officeVital} options={toOptions(lookups.vitalAlertMethods)} onChange={updateOffice('officeVital')} invalid={invalidFor('officeVital')} /></Field>
            <Field label="New order notification to office" hint={hintFor('officeOrder')}><Select value={form.officeOrder} options={toOptions(lookups.orderNotifMethods)} onChange={updateOffice('officeOrder')} invalid={invalidFor('officeOrder')} /></Field>
            <Field label="Physician group" hint={hintFor('officePhysicianGroup')}><Input value={form.officePhysicianGroup} onChange={updateOffice('officePhysicianGroup')} invalid={invalidFor('officePhysicianGroup')} /></Field>
            <Field label="Additional details" style={{ gridColumn: '1 / -1' }} hint={hintFor('additionalDetails')}>
              <textarea
                value={form.additionalDetails}
                onChange={update('additionalDetails')}
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  background: 'var(--surface-card)',
                  border: 'var(--border-width) solid var(--border-field)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)',
                  color: 'var(--text-heading)', outline: 'none',
                  resize: 'vertical', overflowY: 'auto',
                }}
              />
            </Field>
          </div>
        </Card>
      </div>

      <div style={{ position: 'sticky', bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px var(--page-gutter)', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(6px)', borderTop: '1px solid var(--border-card)' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-small)', color: error ? 'var(--danger-600)' : 'var(--text-muted)' }}>
          {error ?? (pendingCount === 0 ? 'All required fields complete' : `${pendingCount} field${pendingCount > 1 ? 's' : ''} to complete`)}
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Submit request'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '48px var(--page-gutter)', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>
      {children}
    </div>
  );
}
