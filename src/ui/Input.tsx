import { useState, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Render the value in IBM Plex Mono — use for NPI, branch code, zip, phone, fax. */
  mono?: boolean;
  invalid?: boolean;
}

/**
 * Input — single-line text field. Set mono for machine values
 * (NPI, branch code, zip, phone, fax).
 */
export function Input({
  value, defaultValue, placeholder, type = 'text',
  mono = false, invalid = false, disabled = false,
  onChange, style, ...rest
}: InputProps) {
  const [focus, setFocus] = useState(false);
  const borderColor = invalid
    ? 'var(--danger-600)'
    : focus ? 'var(--blue-500)' : 'var(--border-field)';
  return (
    <input
      type={type}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      onChange={onChange}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: '100%', height: 'var(--input-h)', boxSizing: 'border-box',
        padding: '0 12px',
        background: disabled ? 'var(--surface-subtle)' : 'var(--surface-card)',
        border: `${focus || invalid ? 'var(--border-width-focus)' : 'var(--border-width)'} solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontSize: 'var(--fs-body)', color: 'var(--text-heading)',
        outline: 'none',
        boxShadow: focus && !invalid ? 'var(--ring-focus)' : 'none',
        transition: 'box-shadow .12s ease, border-color .12s ease',
        ...style,
      }}
      {...rest}
    />
  );
}
