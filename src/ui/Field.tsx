import { type CSSProperties, type ReactNode } from 'react';

interface FieldProps {
  /** Field label rendered above the control. */
  label?: string;
  /** Shows a red required marker after the label. */
  required?: boolean;
  /** Helper text below the control (e.g. allowed values, default note). */
  hint?: ReactNode;
  htmlFor?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Field — label + required marker + helper/hint wrapper for any control.
 * Lays out the 6px label-to-control rhythm used throughout the forms.
 */
export function Field({ label, required = false, hint, htmlFor, children, style }: FieldProps) {
  return (
    <div style={{ ...style }}>
      {label && (
        <label
          htmlFor={htmlFor}
          style={{
            display: 'block', marginBottom: '6px',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-label)',
            fontWeight: 'var(--fw-semibold)', color: 'var(--text-label)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--text-required)' }}> *</span>}
        </label>
      )}
      {children}
      {hint && (
        <span style={{
          display: 'block', marginTop: '5px',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)',
          color: 'var(--text-faint)',
        }}>
          {hint}
        </span>
      )}
    </div>
  );
}
