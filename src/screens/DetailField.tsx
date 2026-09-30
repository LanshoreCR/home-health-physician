import { type ChangeEvent, type CSSProperties } from 'react';
import { useWatch, type ControllerRenderProps } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useCatalogOptions, useLabelFor } from '../hooks/useLookups';
import type { CatalogName } from '../store/catalogs';
import type { RequestDraft } from '../data/types';
import { FormField, TextArea } from './RequestFields';
import { formatPhone, onlyAlphanumeric, type DraftKey } from './requestDraft';

type DetailFieldKind = 'text' | 'email' | 'mono' | 'alphanumeric' | 'phone' | 'date' | 'catalog' | 'yesNo' | 'longText';
type DraftField = ControllerRenderProps<RequestDraft, DraftKey>;

const MONO_KINDS: DetailFieldKind[] = ['mono', 'alphanumeric', 'phone'];
const YES_NO = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];

interface DetailFieldProps {
  name: DraftKey;
  label: string;
  editing: boolean;
  kind?: DetailFieldKind;
  catalog?: CatalogName;
  required?: boolean;
  wide?: boolean;
}

/**
 * Subgrid: label, control y hint ocupan filas compartidas con los vecinos, así
 * una etiqueta que se parte en dos líneas baja a toda la fila y los controles
 * siguen alineados.
 */
function rowStyle(rows: number, wide?: boolean): CSSProperties {
  return {
    display: 'grid',
    gridTemplateRows: 'subgrid',
    gridRow: `span ${rows}`,
    rowGap: 0,
    gridColumn: wide ? '1 / -1' : undefined,
  };
}

/** Un dato del detalle: se lee como KV y, en modo edición, es el control del form. */
export function DetailField({ name, label, editing, kind = 'text', catalog, required, wide }: DetailFieldProps) {
  if (!editing) return <ReadValue name={name} label={label} kind={kind} catalog={catalog} style={rowStyle(2, wide)} />;

  return (
    <FormField name={name} label={label} required={required} style={rowStyle(3, wide)}>
      {(field, invalid) => <EditControl field={field} invalid={invalid} kind={kind} catalog={catalog} />}
    </FormField>
  );
}

function KV({ label, value, mono, style }: { label: string; value: string; mono?: boolean; style?: CSSProperties }) {
  return (
    <div style={style}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-label)', color: 'var(--text-faint)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: mono ? 'var(--fs-body)' : 'var(--fs-value-lg)', fontWeight: mono ? 400 : 500, color: 'var(--text-heading)' }}>{value || '—'}</div>
    </div>
  );
}

function ReadValue({ name, label, kind, catalog, style }: {
  name: DraftKey;
  label: string;
  kind: DetailFieldKind;
  catalog?: CatalogName;
  style?: CSSProperties;
}) {
  const value = useWatch<RequestDraft, DraftKey>({ name });
  const labelFor = useLabelFor();
  return (
    <KV label={label} value={displayValue(value, catalog, labelFor)} mono={MONO_KINDS.includes(kind)} style={style} />
  );
}

function displayValue(
  value: string | boolean,
  catalog: CatalogName | undefined,
  labelFor: (name: CatalogName, code: string) => string,
): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (catalog) return labelFor(catalog, value);
  return value;
}

function textChange(field: DraftField, kind: DetailFieldKind) {
  return (e: ChangeEvent<HTMLInputElement>) => {
    if (kind === 'phone') return field.onChange(formatPhone(e.target.value));
    if (kind === 'alphanumeric') return field.onChange(onlyAlphanumeric(e.target.value));
    field.onChange(e.target.value);
  };
}

function EditControl({ field, invalid, kind, catalog }: {
  field: DraftField;
  invalid: boolean;
  kind: DetailFieldKind;
  catalog?: CatalogName;
}) {
  const text = typeof field.value === 'string' ? field.value : '';
  const common = { name: field.name, onBlur: field.onBlur, ref: field.ref };

  if (kind === 'yesNo') {
    return (
      <Select
        {...common}
        value={field.value === true ? 'yes' : 'no'}
        options={YES_NO}
        placeholder=""
        onChange={(e) => field.onChange(e.target.value === 'yes')}
      />
    );
  }
  if (kind === 'catalog' && catalog) {
    return <CatalogSelect {...common} catalog={catalog} value={text} invalid={invalid} onChange={field.onChange} />;
  }
  if (kind === 'longText') {
    return <TextArea {...common} value={text} onChange={(e) => field.onChange(e.target.value)} />;
  }
  return (
    <Input
      {...common}
      type={kind === 'date' || kind === 'email' ? kind : 'text'}
      mono={MONO_KINDS.includes(kind)}
      value={text}
      invalid={invalid}
      onChange={textChange(field, kind)}
    />
  );
}

function CatalogSelect({ catalog, onChange, ...rest }: {
  catalog: CatalogName;
  name: string;
  value: string;
  invalid: boolean;
  onBlur: () => void;
  ref: DraftField['ref'];
  onChange: (value: string) => void;
}) {
  const options = useCatalogOptions(catalog);
  return <Select {...rest} options={options} onChange={(e) => onChange(e.target.value)} />;
}
