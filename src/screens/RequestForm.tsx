import { useState, type ChangeEvent } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DEGREES, VITAL, ORDER, STATES } from '../data/seed';
import type { RequestDraft } from '../data/types';

const EMPTY: RequestDraft = {
  first: '', last: '', npi: '', branch: '', degree: '',
  vitalAlerts: '', orderNotif: '',
  address: '', city: '', state: '', zip: '', phone: '', fax: '',
  officeVital: 'Fax', officeOrder: '',
};

const REQUIRED: (keyof RequestDraft)[] = [
  'first', 'last', 'branch', 'degree', 'npi',
  'vitalAlerts', 'orderNotif',
  'address', 'city', 'state', 'zip', 'phone', 'fax',
];

interface RequestFormProps {
  mode: 'create' | 'edit';
  values?: Partial<RequestDraft>;
  onCancel: () => void;
  onSubmit: (values: RequestDraft) => void;
  onSaveDraft: (values: RequestDraft) => void;
}

/**
 * RequestForm — create / edit a physician request. Three sectioned cards
 * (Physician, Notifications, Office) and a sticky save/submit footer.
 * Required fields are validated on submit and flagged inline.
 */
export function RequestForm({ mode, values, onCancel, onSubmit, onSaveDraft }: RequestFormProps) {
  const [form, setForm] = useState<RequestDraft>({ ...EMPTY, ...values });
  const [attempted, setAttempted] = useState(false);

  const update = (key: keyof RequestDraft) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const missing = REQUIRED.filter((k) => !form[k].trim());
  const invalidFor = (k: keyof RequestDraft) => attempted && !form[k].trim();

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

        <Card step={1} title="Physician" style={{ marginBottom: 'var(--section-gap)' }}>
          <div className="form-grid">
            <Field label="First name" required><Input value={form.first} onChange={update('first')} invalid={invalidFor('first')} /></Field>
            <Field label="Last name" required><Input value={form.last} onChange={update('last')} invalid={invalidFor('last')} /></Field>
            <Field label="Branch code" required><Input mono value={form.branch} onChange={update('branch')} invalid={invalidFor('branch')} /></Field>
            <Field label="Degree" required hint="MD · DO · DPM · NP · PA"><Select value={form.degree} options={DEGREES} onChange={update('degree')} invalid={invalidFor('degree')} /></Field>
            <Field label="NPI number" required hint="10-digit National Provider Identifier"><Input mono value={form.npi} onChange={update('npi')} invalid={invalidFor('npi')} /></Field>
          </div>
        </Card>

        <Card step={2} title="Notifications" style={{ marginBottom: 'var(--section-gap)' }}>
          <div className="form-grid">
            <Field label="Preferred method of vital sign alerts" required hint="Phone · Fax · Email · Web"><Select value={form.vitalAlerts} options={VITAL} onChange={update('vitalAlerts')} invalid={invalidFor('vitalAlerts')} /></Field>
            <Field label="Method of new order notification" required hint="Fax · Paper · Website · Deliver · Interface"><Select value={form.orderNotif} options={ORDER} onChange={update('orderNotif')} invalid={invalidFor('orderNotif')} /></Field>
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
            <Field label="Phone" required><Input mono value={form.phone} onChange={update('phone')} invalid={invalidFor('phone')} /></Field>
            <Field label="Fax" required><Input mono value={form.fax} onChange={update('fax')} invalid={invalidFor('fax')} /></Field>
            <Field label="Vital sign alerts to office" hint="Defaults to Fax if left empty"><Select value={form.officeVital} options={VITAL} onChange={update('officeVital')} /></Field>
            <Field label="New order notification to office" hint="Fax · Paper · Website · Deliver · Interface"><Select value={form.officeOrder} options={ORDER} onChange={update('officeOrder')} /></Field>
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
