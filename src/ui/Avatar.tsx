import { type CSSProperties } from 'react';

interface AvatarProps {
  /** User initials, e.g. "WT". */
  initials?: string;
  /** Pixel diameter. @default 32 */
  size?: number;
  style?: CSSProperties;
}

/**
 * Avatar — initials chip for users (submitter / reviewer).
 */
export function Avatar({ initials = '?', size = 32, style }: AvatarProps) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: '50%',
      background: 'var(--avatar-bg)', color: 'var(--avatar-fg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-semibold)',
      fontSize: size <= 28 ? '11px' : '12px',
      ...style,
    }}>
      {initials}
    </div>
  );
}
