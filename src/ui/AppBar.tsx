import { type ReactNode } from 'react';
import { Avatar } from './Avatar';

interface AppBarProps {
  crumb?: ReactNode;
  role: string;
  initials: string;
}

/**
 * AppBar — sticky top chrome. Shows the brand on the list, or a breadcrumb
 * back to Requests on detail / form. Right side carries the role + avatar.
 */
export function AppBar({ crumb, role, initials }: AppBarProps) {
  return (
    <div className="appbar">
      <div className="appbar-inner">
        {crumb ? (
          <div className="crumb">{crumb}</div>
        ) : (
          <div className="brand">
            <div className="mark" />
            <div>
              <div className="t">Physician Add Tool</div>
              <div className="s">Adoration Home Health</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="role"><span className="d" style={{ background: 'var(--blue-500)' }} />{role}</div>
          <Avatar initials={initials} />
        </div>
      </div>
    </div>
  );
}
