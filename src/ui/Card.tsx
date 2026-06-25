import { type CSSProperties, type ReactNode } from 'react';

interface CardProps {
  /** Section heading shown next to a numbered step badge. */
  title?: string;
  /** Uppercase eyebrow heading (detail read-only groups). */
  eyebrow?: string;
  /** Step number; renders the blue numbered badge + title. */
  step?: number | string;
  padding?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Card — the white panel used for form sections and detail groups.
 * Optional eyebrow title (uppercase) or numbered section header.
 */
export function Card({ title, eyebrow, step, padding, children, style }: CardProps) {
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-xl)',
      padding: padding || 'var(--card-pad)',
      ...style,
    }}>
      {step != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '24px', height: '24px', borderRadius: 'var(--radius-sm)',
            background: 'var(--blue-50)', color: 'var(--blue-500)',
            fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-bold)', fontSize: '12px',
          }}>{step}</span>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)', fontSize: 'var(--fs-section)', color: 'var(--text-heading)' }}>{title}</h2>
        </div>
      )}
      {eyebrow && (
        <h2 style={{
          margin: '0 0 18px', fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)',
          fontSize: 'var(--fs-mono)', letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase',
          color: 'var(--text-faint)',
        }}>{eyebrow}</h2>
      )}
      {children}
    </div>
  );
}
