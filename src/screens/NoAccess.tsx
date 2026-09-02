import { Button } from '../ui/Button';

const LockIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);

/**
 * Lo que ve alguien autenticado en Okta pero fuera de los dos grupos de
 * seguridad. La app no se monta detrás de esta pantalla: sin rol, cada
 * request de datos volvería en 403.
 */
export function NoAccess({ name, onSignOut }: { name: string; onSignOut: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px',
      background: 'var(--surface-page)', padding: '0 var(--page-gutter)', textAlign: 'center',
    }}>
      {LockIcon}
      <h1 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--fs-page-title)', color: 'var(--text-heading)', letterSpacing: 'var(--ls-tight)' }}>
        You don't have access to this application
      </h1>
      <p style={{ margin: 0, maxWidth: '460px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', color: 'var(--text-muted)' }}>
        {name} is signed in, but is not a member of a Physician Add Tool security group.
        Ask your administrator to be added, then sign in again.
      </p>
      <Button variant="secondary" onClick={onSignOut}>Sign out</Button>
    </div>
  );
}
