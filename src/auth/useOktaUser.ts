import { useMemo } from 'react';
import { oktaAuth } from './okta';

export interface OktaUser {
  name: string;
  initials: string;
}

/** El id token ya está en storage cuando el AuthGate deja pasar: no hace falta red. */
export function useOktaUser(): OktaUser {
  return useMemo(() => {
    const claims = oktaAuth.tokenManager.getTokensSync().idToken?.claims;
    const name = claims?.name ?? claims?.preferred_username ?? 'Signed in';
    return { name, initials: initialsOf(name) };
  }, []);
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
