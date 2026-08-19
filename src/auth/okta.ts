import { OktaAuth } from '@okta/okta-auth-js';

/** Definida pero vacía cuenta como ausente: es la forma típica de un build mal configurado. */
function env(name: string): string | null {
  const value = import.meta.env[name];
  if (typeof value !== 'string' || value.trim() === '') return null;
  return value.trim();
}

function required(name: string): string {
  const value = env(name);
  if (value === null) throw new Error(`${name} is missing from this build. See .env.example.`);
  return value;
}

const issuer = required('VITE_OKTA_ISSUER');
const clientId = required('VITE_OKTA_CLIENT_ID');

/**
 * Derivado del origen donde se sirve la app, así el mismo build sirve para local y
 * para cada ambiente sin una variable por ambiente. La variable queda como override
 * para cuando el origen no es el registrado en Okta (slots de Azure, dominio propio).
 */
const redirectUri = env('VITE_OKTA_REDIRECT_URI') ?? `${window.location.origin}/login/callback`;

/** Mismo criterio que redirectUri. Tiene que estar en los Sign-out redirect URIs de Okta. */
const postLogoutRedirectUri = env('VITE_OKTA_POST_LOGOUT_REDIRECT_URI') ?? window.location.origin;

export const oktaAuth = new OktaAuth({
  issuer,
  clientId,
  redirectUri,
  postLogoutRedirectUri,
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

/**
 * Cierra la sesión de Okta, no solo la local: al volver al origen el gate no
 * encuentra token y manda de nuevo a Okta, que ya no tiene cookie y pide login.
 *
 * clearTokensBeforeRedirect porque el default solo los marca como pendingRemove
 * y los borra en tokenManager.start(), que corre desde oktaAuth.start(). La app
 * no lo usa, así que sin esto los tokens sobreviven al logout.
 */
export async function signOut(): Promise<void> {
  await oktaAuth.signOut({ clearTokensBeforeRedirect: true });
}
