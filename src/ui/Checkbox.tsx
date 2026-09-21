import { useState } from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Para los checkbox sin label visible, como la columna de la lista. */
  ariaLabel?: string;
}

const CheckIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

/**
 * Un checkbox deshabilitado se distingue por el relleno gris, no por la
 * opacidad: bajado solo a 0.6 se leía igual que uno vacío y accionable.
 */
function boxBackground(checked: boolean, disabled: boolean): string {
  if (checked && !disabled) return 'var(--blue-500)';
  if (checked) return 'var(--slate-300)';
  if (disabled) return 'var(--slate-100)';
  return 'var(--surface-card)';
}

function boxBorderColor(checked: boolean, disabled: boolean, highlight: boolean): string {
  if (checked && !disabled) return 'var(--blue-500)';
  if (disabled) return 'var(--slate-300)';
  if (highlight) return 'var(--blue-500)';
  return 'var(--border-field)';
}

/**
 * Checkbox — a custom box styled with the same tokens as Input/Select
 * (border, radius, focus ring, brand blue), backed by a real native input
 * for keyboard and accessibility. Rendered as a clickable label row.
 */
export function Checkbox({ label, checked, onChange, disabled = false, ariaLabel }: CheckboxProps) {
  const [focus, setFocus] = useState(false);
  const [hover, setHover] = useState(false);
  const highlight = (focus || hover) && !disabled;
  const cursor = disabled ? 'not-allowed' : 'pointer';
  return (
    <label
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '10px', cursor, userSelect: 'none' }}
    >
      <input
        type="checkbox"
        aria-label={ariaLabel}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ position: 'absolute', left: 0, width: '18px', height: '18px', margin: 0, opacity: 0, cursor }}
      />
      <span
        aria-hidden="true"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '18px', height: '18px', flexShrink: 0, boxSizing: 'border-box',
          background: boxBackground(checked, disabled),
          border: `${highlight || focus || checked ? 'var(--border-width-focus)' : 'var(--border-width)'} solid ${boxBorderColor(checked, disabled, highlight)}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow: highlight ? 'var(--ring-focus)' : 'none',
          transition: 'background .12s ease, border-color .12s ease, box-shadow .12s ease',
          opacity: disabled ? 0.7 : 1,
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
