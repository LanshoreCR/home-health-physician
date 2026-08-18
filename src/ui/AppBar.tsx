import { type ReactNode } from 'react';
import { Avatar } from './Avatar';
import { Button } from './Button';

interface AppBarProps {
  crumb?: ReactNode;
  name: string;
  initials: string;
  onSignOut: () => void;
}

/**
 * AppBar — sticky top chrome. Shows the brand on the list, or a breadcrumb
 * back to Requests on detail / form. Right side carries the signed-in user.
 */
export function AppBar({ crumb, name, initials, onSignOut }: AppBarProps) {
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
          <div className="role"><span className="d" style={{ background: 'var(--blue-500)' }} />{name}</div>
          <Avatar initials={initials} />
          <Button variant="ghost" size="sm" onClick={onSignOut}>Sign out</Button>
        </div>
      </div>
    </div>
  );
}
