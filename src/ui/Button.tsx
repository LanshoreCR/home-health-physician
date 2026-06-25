import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

const VARIANTS = {
  primary: {
    background: 'var(--blue-500)', borderColor: 'var(--blue-500)',
    color: 'var(--text-on-primary)', boxShadow: 'var(--shadow-button)',
    hoverBg: 'var(--blue-600)',
  },
  secondary: {
    background: 'var(--surface-card)', borderColor: 'var(--border-field)',
    color: 'var(--slate-800)', boxShadow: 'none', hoverBg: 'var(--surface-subtle)',
  },
  ghost: {
    background: 'transparent', borderColor: 'transparent',
    color: 'var(--slate-600)', boxShadow: 'none', hoverBg: 'var(--slate-100)',
  },
  success: {
    background: 'var(--success-500)', borderColor: 'var(--success-500)',
    color: '#fff', boxShadow: 'var(--shadow-success)', hoverBg: 'var(--success-600)',
  },
  danger: {
    background: 'var(--surface-card)', borderColor: 'var(--danger-border)',
    color: 'var(--danger-600)', boxShadow: 'none', hoverBg: 'var(--danger-50)',
  },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

/**
 * Button — primary action control across the Physician Add Tool.
 * Variants: primary | secondary | ghost | success | danger.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  icon = null,
  iconRight = null,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  children,
  style,
  ...rest
}: ButtonProps) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const [hover, setHover] = useState(false);
  const height = size === 'lg' ? 42 : size === 'sm' ? 34 : 'var(--control-h)';
  const pad = size === 'lg' ? '0 20px' : size === 'sm' ? '0 12px' : '0 16px';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: '8px', height, padding: pad, width: fullWidth ? '100%' : 'auto',
        background: disabled ? 'var(--slate-100)' : (hover ? v.hoverBg : v.background),
        border: `1px solid ${disabled ? 'var(--border-field)' : v.borderColor}`,
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)',
        fontSize: 'var(--fs-body)',
        color: disabled ? 'var(--slate-400)' : v.color,
        boxShadow: disabled ? 'none' : v.boxShadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background .12s ease',
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
