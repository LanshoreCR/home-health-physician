import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  useForm,
  type ControllerRenderProps,
  type FieldPath,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Skeleton } from '../ui/Skeleton';
import { useLookups } from '../hooks/useLookups';
import { saveRequestSchema, toOptions, validateDraft } from '../api/schemas';
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

type DraftKey = FieldPath<RequestDraft>;
type OfficeKey = 'officeVital' | 'officeOrder' | 'officePhysicianGroup';

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

interface FormFieldProps<K extends DraftKey> {
  name: K;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  style?: React.CSSProperties;
  children: (field: ControllerRenderProps<RequestDraft, K>, invalid: boolean) => ReactNode;
}

/**
 * Puente entre el Controller de react-hook-form y el Field del design system:
 * el mensaje del error sustituye al hint mientras exista, igual que antes.
 */
function FormField<K extends DraftKey>({ name, label, required, hint, style, children }: FormFieldProps<K>) {
  const { control } = useFormContext<RequestDraft>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          label={label}
          required={required}
          style={style}
          hint={fieldState.error?.message ? <ErrorHint text={fieldState.error.message} /> : hint}
        >
          {children(field, Boolean(fieldState.error))}
        </Field>
      )}
    />
  );
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
  const [touched, setTouched] = useState<Set<string>>(
    () => new Set(mode === 'edit' ? ['officeVital', 'officeOrder', 'officePhysicianGroup'] : []),
  );

  /**
   * raw: true devuelve el estado del form, no la salida del schema — los
   * .transform(emptyToNull) se aplican en toSaveBody, ya en la capa de API.
   */
  const form = useForm<RequestDraft>({
    defaultValues: { ...EMPTY, ...values },
    resolver: zodResolver(saveRequestSchema, undefined, { raw: true }),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const { control, handleSubmit, setValue, setError, watch } = form;

  useEffect(() => {
    Object.entries(fieldErrors).forEach(([key, messages]) => {
      if (messages[0]) setError(key as DraftKey, { type: 'server', message: messages[0] });
    });
  }, [fieldErrors, setError]);

  const pendingCount = Object.keys(validateDraft(watch()).fieldErrors).length;

  const markTouched = (key: OfficeKey) => setTouched((t) => new Set(t).add(key));

  /** El campo de oficina sigue al de physician hasta que el usuario lo edita. */
  const mirrorTo = <K extends DraftKey>(field: ControllerRenderProps<RequestDraft, K>, office: OfficeKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      field.onChange(e);
      if (!touched.has(office)) setValue(office, e.target.value);
    };

  const officeChange = <K extends DraftKey>(field: ControllerRenderProps<RequestDraft, K>, office: OfficeKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      markTouched(office);
      field.onChange(e);
    };

  const phoneChange = <K extends DraftKey>(field: ControllerRenderProps<RequestDraft, K>) =>
    (e: ChangeEvent<HTMLInputElement>) => field.onChange(formatPhone(e.target.value));

  const digitsChange = <K extends DraftKey>(field: ControllerRenderProps<RequestDraft, K>) =>
    (e: ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value.replace(/[^0-9]/g, ''));

  /** Un refresh de fondo que falla no debe blanquear un form que ya tiene catálogos. */
  if (lookupsError && !lookups) {
    return (
      <Centered>
        <div style={{ color: 'var(--danger-600)', marginBottom: '12px' }}>{lookupsError}</div>
        <Button variant="secondary" onClick={retry}>Retry</Button>
      </Centered>
    );
  }

  if (!lookups) return <FormSkeleton />;

  return (
    <FormProvider {...form}>
      <div style={{ background: 'var(--surface-page)', position: 'relative', maxWidth: 'var(--page-max)', margin: '0 auto' }}>
        <div style={{ padding: '28px var(--page-gutter) 0' }}>
          <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--fs-form-title)', color: 'var(--text-heading)', letterSpacing: 'var(--ls-tight)' }}>{mode === 'edit' ? 'Edit physician request' : 'New physician request'}</h1>
          <p style={{ margin: '0 0 26px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)' }}>Complete all required fields. The whole template must be filled before you can submit.</p>

          <Card step={1} title="Patient & requester" style={{ marginBottom: 'var(--section-gap)' }}>
            <div className="form-grid">
              <FormField name="patientName" label="Patient name" required>
                {(field, invalid) => <Input {...field} invalid={invalid} />}
              </FormField>
              <FormField name="mrn" label="Medical record number" required hint="Digits only">
                {(field, invalid) => <Input mono inputMode="numeric" {...field} onChange={digitsChange(field)} invalid={invalid} />}
              </FormField>
              <FormField name="patientStatus" label="Patient episode status" required>
                {(field, invalid) => <Select {...field} options={toOptions(lookups.patientStatuses)} invalid={invalid} />}
              </FormField>
              <FormField name="requesterName" label="Requester name" required>
                {(field, invalid) => <Input {...field} invalid={invalid} />}
              </FormField>
              <FormField name="requesterEmail" label="Requester email" required>
                {(field, invalid) => <Input type="email" {...field} invalid={invalid} />}
              </FormField>
            </div>
          </Card>

          <Card step={2} title="Physician" style={{ marginBottom: 'var(--section-gap)' }}>
            <div className="form-grid">
              <FormField name="first" label="First name" required>
                {(field, invalid) => <Input {...field} invalid={invalid} />}
              </FormField>
              <FormField name="last" label="Last name" required>
                {(field, invalid) => <Input {...field} invalid={invalid} />}
              </FormField>
              <FormField name="degree" label="Degree" required hint="MD · DO · DPM · NP · PA">
                {(field, invalid) => <Select {...field} options={toOptions(lookups.degrees)} invalid={invalid} />}
              </FormField>
              <FormField name="npi" label="NPI number" required hint="10-digit National Provider Identifier">
                {(field, invalid) => <Input mono {...field} invalid={invalid} />}
              </FormField>
              <FormField name="vitalAlerts" label="Preferred method of vital sign alerts" required hint="Phone · Fax · Email · Web">
                {(field, invalid) => <Select {...field} onChange={mirrorTo(field, 'officeVital')} options={toOptions(lookups.vitalAlertMethods)} invalid={invalid} />}
              </FormField>
              <FormField name="orderNotif" label="Method of new order notification" required hint="F-Fax · F-Delivery · F-Paper · F-Circle · Email · Website · Interface">
                {(field, invalid) => <Select {...field} onChange={mirrorTo(field, 'officeOrder')} options={toOptions(lookups.orderNotifMethods)} invalid={invalid} />}
              </FormField>

              <FormField name="physicianType" label="Physician type" required hint="Choose one" style={{ gridColumn: '1 / -1' }}>
                {(field) => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 48px', alignItems: 'center' }}>
                    {toOptions(lookups.physicianTypes).map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={field.value === option.value}
                        onChange={(checked) => field.onChange(checked ? option.value : '')}
                      />
                    ))}
                  </div>
                )}
              </FormField>

              <Field label="Coverage & verification" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 48px', alignItems: 'center' }}>
                  <Controller name="vaTricare" control={control} render={({ field }) => <Checkbox label="VA/Tricare" checked={field.value} onChange={field.onChange} />} />
                  <Controller name="pecosVerified" control={control} render={({ field }) => <Checkbox label="Pecos Verified" checked={field.value} onChange={field.onChange} />} />
                </div>
              </Field>

              <SectionDivider label="Optional" />

              <FormField name="licenseNumber" label="License number">
                {(field, invalid) => <Input {...field} invalid={invalid} />}
              </FormField>
              <FormField name="licenseState" label="License state">
                {(field, invalid) => <Select {...field} options={toOptions(lookups.states)} invalid={invalid} />}
              </FormField>
              <FormField name="licenseExp" label="License expiration date">
                {(field, invalid) => <Input type="date" {...field} invalid={invalid} />}
              </FormField>
              <FormField name="specialty" label="Specialty">
                {(field, invalid) => <Input {...field} invalid={invalid} />}
              </FormField>
              <FormField name="taxonomy" label="Taxonomy" hint="Defaults to None on import if blank">
                {(field, invalid) => <Input {...field} invalid={invalid} />}
              </FormField>
              <FormField name="physicianGroup" label="Physician group" hint="Defaults to None on import if blank">
                {(field, invalid) => <Input {...field} onChange={mirrorTo(field, 'officePhysicianGroup')} invalid={invalid} />}
              </FormField>
            </div>
          </Card>

          <Card step={3} title="Physician's office details" style={{ marginBottom: 'var(--section-gap)' }}>
            <div className="form-grid">
              <FormField name="address" label="Address" required style={{ gridColumn: '1 / -1' }}>
                {(field, invalid) => <Input {...field} invalid={invalid} />}
              </FormField>
              <FormField name="city" label="City" required>
                {(field, invalid) => <Input {...field} invalid={invalid} />}
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <FormField name="state" label="State" required>
                  {(field, invalid) => <Select {...field} options={toOptions(lookups.states)} invalid={invalid} />}
                </FormField>
                <FormField name="zip" label="Zip code" required>
                  {(field, invalid) => <Input mono {...field} invalid={invalid} />}
                </FormField>
              </div>
              <FormField name="phone" label="Phone" required>
                {(field, invalid) => <Input mono {...field} onChange={phoneChange(field)} invalid={invalid} />}
              </FormField>
              <FormField name="fax" label="Fax" required>
                {(field, invalid) => <Input mono {...field} onChange={phoneChange(field)} invalid={invalid} />}
              </FormField>
              <FormField name="branch" label="Branch code" required>
                {(field, invalid) => <Input mono {...field} invalid={invalid} />}
              </FormField>

              <SectionDivider label="Optional" />

              <FormField name="admissionCoordinator" label="Admission coordinator">
                {(field, invalid) => <Input {...field} invalid={invalid} />}
              </FormField>
              <FormField name="officeVital" label="Vital sign alerts to office">
                {(field, invalid) => <Select {...field} onChange={officeChange(field, 'officeVital')} options={toOptions(lookups.vitalAlertMethods)} invalid={invalid} />}
              </FormField>
              <FormField name="officeOrder" label="New order notification to office">
                {(field, invalid) => <Select {...field} onChange={officeChange(field, 'officeOrder')} options={toOptions(lookups.orderNotifMethods)} invalid={invalid} />}
              </FormField>
              <FormField name="officePhysicianGroup" label="Physician group">
                {(field, invalid) => <Input {...field} onChange={officeChange(field, 'officePhysicianGroup')} invalid={invalid} />}
              </FormField>
              <FormField name="additionalDetails" label="Additional details" style={{ gridColumn: '1 / -1' }}>
                {(field) => (
                  <textarea
                    {...field}
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
                )}
              </FormField>
            </div>
          </Card>
        </div>

        <div style={{ position: 'sticky', bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px var(--page-gutter)', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(6px)', borderTop: '1px solid var(--border-card)' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-small)', color: error ? 'var(--danger-600)' : 'var(--text-muted)' }}>
            {error ?? (pendingCount === 0 ? 'All required fields complete' : `${pendingCount} field${pendingCount > 1 ? 's' : ''} to complete`)}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={submitting}>
              {submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Submit request'}
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

function FieldSkeleton() {
  return (
    <div>
      <Skeleton w="46%" h={12} style={{ marginBottom: '6px' }} />
      <Skeleton h="var(--input-h)" radius="var(--radius-md)" />
    </div>
  );
}

function CardSkeleton({ fields }: { fields: number }) {
  return (
    <Card style={{ marginBottom: 'var(--section-gap)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Skeleton w={24} h={24} radius="var(--radius-sm)" />
        <Skeleton w={190} h={17} />
      </div>
      <div className="form-grid">
        {Array.from({ length: fields }, (_, i) => <FieldSkeleton key={i} />)}
      </div>
    </Card>
  );
}

/** Calcado del layout del form (3 cards + footer sticky) mientras cargan los lookups. */
function FormSkeleton() {
  return (
    <div style={{ background: 'var(--surface-page)', position: 'relative', maxWidth: 'var(--page-max)', margin: '0 auto' }}>
      <div style={{ padding: '28px var(--page-gutter) 0' }}>
        <Skeleton w={340} h={26} radius="var(--radius-md)" style={{ marginBottom: '10px' }} />
        <Skeleton w={480} h={14} style={{ marginBottom: '26px' }} />
        <CardSkeleton fields={6} />
        <CardSkeleton fields={12} />
        <CardSkeleton fields={12} />
      </div>
      <div style={{ position: 'sticky', bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px var(--page-gutter)', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(6px)', borderTop: '1px solid var(--border-card)' }}>
        <Skeleton w={150} h={13} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <Skeleton w={84} h="var(--control-h)" radius="var(--radius-md)" />
          <Skeleton w={140} h="var(--control-h)" radius="var(--radius-md)" />
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
