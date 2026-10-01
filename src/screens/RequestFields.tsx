import { type CSSProperties, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Controller, useFormContext, type ControllerRenderProps } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { validateDraft } from '../api/schemas';
import type { RequestDraft } from '../data/types';
import type { DraftKey } from './requestDraft';

function ErrorHint({ text }: { text: string }) {
  return <span style={{ color: 'var(--text-required)' }}>{text}</span>;
}

interface FormFieldProps<K extends DraftKey> {
  name: K;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  style?: CSSProperties;
  children: (field: ControllerRenderProps<RequestDraft, K>, invalid: boolean) => ReactNode;
}

/**
 * Puente entre el Controller de react-hook-form y el Field del design system:
 * el mensaje del error sustituye al hint mientras exista.
 */
export function FormField<K extends DraftKey>({ name, label, required, hint, style, children }: FormFieldProps<K>) {
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

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
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
  );
}

interface FormFooterProps {
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}

export function FormFooter({ submitLabel, submitting, error, onCancel, onSubmit }: FormFooterProps) {
  const { watch } = useFormContext<RequestDraft>();
  const pendingCount = Object.keys(validateDraft(watch()).fieldErrors).length;
  return (
    <div style={{ position: 'sticky', bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px var(--page-gutter)', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(6px)', borderTop: '1px solid var(--border-card)' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-small)', color: error ? 'var(--danger-600)' : 'var(--text-muted)' }}>
        {error ?? (pendingCount === 0 ? 'All required fields complete' : `${pendingCount} field${pendingCount > 1 ? 's' : ''} to complete`)}
      </span>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button variant="primary" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </div>
  );
}
