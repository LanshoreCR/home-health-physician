import { useState, type ChangeEvent } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { DEGREES, VITAL, ORDER, STATES, PATIENT_STATUS } from '../data/seed';
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

type RequiredKey =
  | 'patientName' | 'mrn' | 'patientStatus' | 'requesterName' | 'requesterEmail'
  | 'first' | 'last' | 'degree' | 'npi' | 'physicianType'
  | 'vitalAlerts' | 'orderNotif'
  | 'branch' | 'address' | 'city' | 'state' | 'zip' | 'phone' | 'fax';

const REQUIRED: RequiredKey[] = [
  'patientName', 'mrn', 'patientStatus', 'requesterName', 'requesterEmail',
  'first', 'last', 'degree', 'npi', 'physicianType',
  'vitalAlerts', 'orderNotif',
  'branch', 'address', 'city', 'state', 'zip', 'phone', 'fax',
];

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

interface RequestFormProps {
  mode: 'create' | 'edit';
  values?: Partial<RequestDraft>;
  onCancel: () => void;
  onSubmit: (values: RequestDraft) => void;
  onSaveDraft: (values: RequestDraft) => void;
}

/**
 * RequestForm — create / edit a physician request. Three sectioned cards
 * (Patient & requester, Physician, Office) and a sticky save/submit footer.
 * Office fields auto-populate from their physician-side source until edited.
 * Required fields are validated on submit and flagged inline.
 */
export function RequestForm({ mode, values, onCancel, onSubmit, onSaveDraft }: RequestFormProps) {
  const [form, setForm] = useState<RequestDraft>({ ...EMPTY, ...values });
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(
    () => new Set(mode === 'edit' ? ['officeVital', 'officeOrder', 'officePhysicianGroup'] : []),
  );

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

  const missing = REQUIRED.filter((k) => !form[k].trim());
  const invalidFor = (k: RequiredKey) => attempted && !form[k].trim();

  const handleSubmit = () => {
    if (missing.length > 0) {
      setAttempted(true);
      return;
    }
    onSubmit(form);
  };

  return (
    <div style={{ background: 'var(--surface-page)', position: 'relative', maxWidth: 'var(--page-max)', margin: '0 auto' }}>
      <div style={{ padding: '28px var(--page-gutter) 0' }}>
        <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--fs-form-title)', color: 'var(--text-heading)', letterSpacing: 'var(--ls-tight)' }}>{mode === 'edit' ? 'Edit physician request' : 'New physician request'}</h1>
        <p style={{ margin: '0 0 26px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>Complete all required fields. The whole template must be filled before you can submit.</p>

        <Card step={1} title="Patient & requester" style={{ marginBottom: 'var(--section-gap)' }}>
          <div className="form-grid">
            <Field label="Patient name" required><Input value={form.patientName} onChange={update('patientName')} invalid={invalidFor('patientName')} /></Field>
            <Field label="Medical record number" required><Input mono value={form.mrn} onChange={update('mrn')} invalid={invalidFor('mrn')} /></Field>
            <Field label="Patient episode status" required><Select value={form.patientStatus} options={PATIENT_STATUS} onChange={update('patientStatus')} invalid={invalidFor('patientStatus')} /></Field>
            <Field label="Requester name" required><Input value={form.requesterName} onChange={update('requesterName')} invalid={invalidFor('requesterName')} /></Field>
            <Field label="Requester email" required><Input type="email" value={form.requesterEmail} onChange={update('requesterEmail')} invalid={invalidFor('requesterEmail')} /></Field>
          </div>
        </Card>

        <Card step={2} title="Physician" style={{ marginBottom: 'var(--section-gap)' }}>
          <div className="form-grid">
            <Field label="First name" required><Input value={form.first} onChange={update('first')} invalid={invalidFor('first')} /></Field>
            <Field label="Last name" required><Input value={form.last} onChange={update('last')} invalid={invalidFor('last')} /></Field>
            <Field label="Degree" required hint="MD · DO · DPM · NP · PA"><Select value={form.degree} options={DEGREES} onChange={update('degree')} invalid={invalidFor('degree')} /></Field>
            <Field label="NPI number" required hint="10-digit National Provider Identifier"><Input mono value={form.npi} onChange={update('npi')} invalid={invalidFor('npi')} /></Field>
            <Field label="Preferred method of vital sign alerts" required hint="Phone · Fax · Email · Web"><Select value={form.vitalAlerts} options={VITAL} onChange={update('vitalAlerts')} invalid={invalidFor('vitalAlerts')} /></Field>
            <Field label="Method of new order notification" required hint="F-Fax · F-Delivery · F-Paper · F-Circle · Email · Website · Interface"><Select value={form.orderNotif} options={ORDER} onChange={update('orderNotif')} invalid={invalidFor('orderNotif')} /></Field>

            <Field label="Physician type" required style={{ gridColumn: '1 / -1' }} hint={invalidFor('physicianType') ? <span style={{ color: 'var(--text-required)' }}>Select F2F Only or Primary/Secondary</span> : 'Choose one'}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 48px', alignItems: 'center' }}>
                <Checkbox label="F2F Only" checked={form.physicianType === 'f2f'} onChange={togglePhysicianType('f2f')} />
                <Checkbox label="Primary/Secondary" checked={form.physicianType === 'primarySecondary'} onChange={togglePhysicianType('primarySecondary')} />
              </div>
            </Field>

            <Field label="Coverage & verification" required style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 48px', alignItems: 'center' }}>
                <Checkbox label="VA/Tricare" checked={form.vaTricare} onChange={toggle('vaTricare')} />
                <Checkbox label="Pecos Verified" checked={form.pecosVerified} onChange={toggle('pecosVerified')} />
              </div>
            </Field>

            <SectionDivider label="Optional" />

            <Field label="License number"><Input value={form.licenseNumber} onChange={update('licenseNumber')} /></Field>
            <Field label="License state"><Select value={form.licenseState} options={STATES} onChange={update('licenseState')} /></Field>
            <Field label="License expiration date"><Input type="date" value={form.licenseExp} onChange={update('licenseExp')} /></Field>
            <Field label="Specialty"><Input value={form.specialty} onChange={update('specialty')} /></Field>
            <Field label="Taxonomy" hint="Defaults to None on import if blank"><Input value={form.taxonomy} onChange={update('taxonomy')} /></Field>
            <Field label="Physician group" hint="Defaults to None on import if blank"><Input value={form.physicianGroup} onChange={update('physicianGroup')} /></Field>
          </div>
        </Card>

        <Card step={3} title="Physician's office details" style={{ marginBottom: 'var(--section-gap)' }}>
          <div className="form-grid">
            <Field label="Address" required style={{ gridColumn: '1 / -1' }}><Input value={form.address} onChange={update('address')} invalid={invalidFor('address')} /></Field>
            <Field label="City" required><Input value={form.city} onChange={update('city')} invalid={invalidFor('city')} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <Field label="State" required><Select value={form.state} options={STATES} onChange={update('state')} invalid={invalidFor('state')} /></Field>
              <Field label="Zip code" required><Input mono value={form.zip} onChange={update('zip')} invalid={invalidFor('zip')} /></Field>
            </div>
            <Field label="Phone" required><Input mono value={form.phone} onChange={updatePhone('phone')} invalid={invalidFor('phone')} /></Field>
            <Field label="Fax" required><Input mono value={form.fax} onChange={updatePhone('fax')} invalid={invalidFor('fax')} /></Field>
            <Field label="Branch code" required><Input mono value={form.branch} onChange={update('branch')} invalid={invalidFor('branch')} /></Field>

            <SectionDivider label="Optional" />

            <Field label="Admission coordinator"><Input value={form.admissionCoordinator} onChange={update('admissionCoordinator')} /></Field>
            <Field label="Vital sign alerts to office"><Select value={form.officeVital} options={VITAL} onChange={updateOffice('officeVital')} /></Field>
            <Field label="New order notification to office"><Select value={form.officeOrder} options={ORDER} onChange={updateOffice('officeOrder')} /></Field>
            <Field label="Physician group"><Input value={form.officePhysicianGroup} onChange={updateOffice('officePhysicianGroup')} /></Field>
            <Field label="Additional details" style={{ gridColumn: '1 / -1' }}>
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
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>{missing.length === 0 ? 'All required fields complete' : `${missing.length} required field${missing.length > 1 ? 's' : ''} to complete`}</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="secondary" onClick={() => onSaveDraft(form)}>Save draft</Button>
          <Button variant="primary" onClick={handleSubmit}>{mode === 'edit' ? 'Save changes' : 'Submit request'}</Button>
        </div>
      </div>
    </div>
  );
}
