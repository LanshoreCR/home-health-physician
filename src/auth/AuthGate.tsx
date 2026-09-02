import { useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser } from '../api/currentUser';
import { NoAccess } from '../screens/NoAccess';
import { loadCatalogs } from '../store/catalogs';
import { hasAccess, useSessionStore } from '../store/session';
import { ensureSession, signOut } from './okta';

type Phase = 'checking' | 'ready' | 'blocked' | 'failed';

export function AuthGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [error, setError] = useState('');
  const user = useSessionStore((state) => state.user);

  useEffect(() => {
    let active = true;

    ensureSession()
      .then(() => getCurrentUser())
      .then((current) => {
        if (!active) return;
        useSessionStore.getState().setUser(current);

        if (!hasAccess(current)) {
          setPhase('blocked');
          return;
        }

        /** Después del rol, no antes: sin rol los catálogos vuelven en 403. */
        void loadCatalogs();
        setPhase('ready');
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Could not sign you in.');
        setPhase('failed');
      });

    return () => {
      active = false;
    };
  }, []);

  if (phase === 'checking') return <Notice text="Signing you in…" />;
  if (phase === 'failed') return <Notice text={error} retry />;
  if (phase === 'blocked') return <NoAccess name={user?.name ?? 'Your account'} onSignOut={() => void signOut()} />;
  return <>{children}</>;
}

function Notice({ text, retry }: { text: string; retry?: boolean }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '12px',
      fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-muted)',
    }}>
      {text}
      {retry && (
        <span className="lnk" style={{ cursor: 'pointer', color: 'var(--blue-500)' }}
          onClick={() => window.location.reload()}>
          Try again
        </span>
      )}
    </div>
  );
}
