import { useEffect, useState, type ReactNode } from 'react';
import { ensureSession } from './okta';

type Phase = 'checking' | 'ready' | 'failed';

export function AuthGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    ensureSession()
      .then(() => {
        if (active) setPhase('ready');
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
