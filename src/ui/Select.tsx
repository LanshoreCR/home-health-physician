import { useState, type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Array of strings or {value,label} objects. */
  options?: (string | SelectOption)[];
  placeholder?: string;
  invalid?: boolean;
}

/**
 * Select — single-choice dropdown styled to match Input.
 * Pass options as an array of strings or {value,label}.
 */
export function Select({
  value, defaultValue, options = [], placeholder = 'Select…',
  disabled = false, invalid = false, onChange, style, ...rest
}: SelectProps) {
  const [focus, setFocus] = useState(false);
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const borderColor = invalid
    ? 'var(--danger-600)'
    : focus ? 'var(--blue-500)' : 'var(--border-field)';
  return (
    <div style={{ position: 'relative', ...style }}>
      <select
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%', height: 'var(--input-h)', boxSizing: 'border-box',
          padding: '0 36px 0 12px', appearance: 'none', WebkitAppearance: 'none',
          background: disabled ? 'var(--surface-subtle)' : 'var(--surface-card)',
          border: `${focus || invalid ? 'var(--border-width-focus)' : 'var(--border-width)'} solid ${borderColor}`,
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)',
          color: value || defaultValue ? 'var(--text-heading)' : 'var(--text-faint)',
          outline: 'none',
          boxShadow: focus && !invalid ? 'var(--ring-focus)' : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        {...rest}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="var(--slate-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
