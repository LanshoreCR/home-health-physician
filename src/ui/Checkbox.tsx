import { useState } from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const CheckIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

/**
 * Checkbox — a custom box styled with the same tokens as Input/Select
 * (border, radius, focus ring, brand blue), backed by a real native input
 * for keyboard and accessibility. Rendered as a clickable label row.
 */
export function Checkbox({ label, checked, onChange, disabled = false }: CheckboxProps) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: disabled ? 'not-allowed' : 'pointer', userSelect: 'none' }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ position: 'absolute', left: 0, width: '18px', height: '18px', margin: 0, opacity: 0, cursor: disabled ? 'not-allowed' : 'pointer' }}
      />
      <span
        aria-hidden="true"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '18px', height: '18px', flexShrink: 0, boxSizing: 'border-box',
          background: checked && !disabled ? 'var(--blue-500)' : checked ? 'var(--slate-300)' : 'var(--surface-card)',
          border: `${focus || checked ? 'var(--border-width-focus)' : 'var(--border-width)'} solid ${checked && !disabled ? 'var(--blue-500)' : 'var(--border-field)'}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow: focus && !disabled ? 'var(--ring-focus)' : 'none',
          transition: 'background .12s ease, border-color .12s ease, box-shadow .12s ease',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {checked && CheckIcon}
      </span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: disabled ? 'var(--text-faint)' : 'var(--text-body)' }}>
        {label}
      </span>
    </label>
  );
}
