import { OktaAuth } from '@okta/okta-auth-js';

const issuer = import.meta.env.VITE_OKTA_ISSUER ?? '';
const clientId = import.meta.env.VITE_OKTA_CLIENT_ID ?? '';
const redirectUri =
  import.meta.env.VITE_OKTA_REDIRECT_URI ?? `${window.location.origin}/login/callback`;

export const oktaAuth = new OktaAuth({
  issuer,
  clientId,
  redirectUri,
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
  /**
   * sessionStorage en vez del localStorage por defecto: el token muere al cerrar
   * la pestaña y no se comparte entre pestañas. El org authorization server emite
   * tokens opacos, así que tampoco hay nada legible guardado.
   */
  tokenManager: { storage: 'sessionStorage' },
  /** Sin router: limpiar la query alcanza, y evita el reload que hace el default. */
  restoreOriginalUri: async (_oktaAuth, originalUri) => {
    window.history.replaceState(null, '', originalUri ?? '/');
  },
});

let pending: Promise<void> | null = null;

/** Memoizado: StrictMode monta dos veces y el callback solo se puede canjear una. */
export function ensureSession(): Promise<void> {
  if (pending) return pending;
  pending = resolveSession();
  return pending;
}

async function resolveSession(): Promise<void> {
  if (oktaAuth.isLoginRedirect()) {
    await oktaAuth.handleLoginRedirect();
    return;
  }

  const { accessToken } = await oktaAuth.tokenManager.getTokens();
  if (accessToken) return;

  await oktaAuth.signInWithRedirect({ originalUri: window.location.href });

  /**
   * signInWithRedirect resuelve apenas dispara la navegación, no cuando llega.
   * Sin esto el gate se abriría por un frame y la app pintaría sin sesión.
   */
  await new Promise<void>(() => {});
}
