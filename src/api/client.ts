const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api';

type TokenProvider = () => string | null | Promise<string | null>;

let getToken: TokenProvider = () => null;
let onUnauthorized: () => void = () => {};

/**
 * Registra de dónde sale el Bearer token, una sola vez en el bootstrap.
 * Sin Okta todavía queda en no-op y las requests salen sin header.
 * Con Okta: configureAuth(() => oktaAuth.getAccessToken() ?? null, () => oktaAuth.signInWithRedirect())
 */
export function configureAuth(provider: TokenProvider, onExpired?: () => void) {
  getToken = provider;
  if (onExpired) onUnauthorized = onExpired;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Una request cancelada porque otra la reemplazó no es un error que mostrar. */
export function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof TypeError) return 'Could not reach the server. Check that the API is running.';
  if (err instanceof Error) return err.message;
  return 'Unexpected error.';
}

function camelKey(key: string): string {
  const path = key.startsWith('$.') ? key.slice(2) : key;
  return path.charAt(0).toLowerCase() + path.slice(1);
}

async function readBody(res: Response): Promise<unknown> {
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('json')) return res.text();
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * El backend responde errores en tres formas distintas: ValidationProblemDetails
 * con llaves PascalCase, ProblemDetails pelado en los 404, y string crudo en los
 * 500 y en las validaciones que vienen de los stored procedures.
 */
async function toApiError(res: Response): Promise<ApiError> {
  const body = await readBody(res);

  if (typeof body === 'string' && body.trim() !== '') {
    return new ApiError(res.status, body);
  }

  if (body && typeof body === 'object') {
    const problem = body as { title?: string; detail?: string; errors?: Record<string, string[]> };
    if (problem.errors) {
      const fieldErrors: Record<string, string[]> = {};
      Object.entries(problem.errors).forEach(([key, messages]) => {
        fieldErrors[camelKey(key)] = messages;
      });
      const first = Object.values(fieldErrors)[0]?.[0];
      return new ApiError(res.status, first ?? problem.title ?? res.statusText, fieldErrors);
    }
    if (problem.detail || problem.title) {
      return new ApiError(res.status, problem.detail ?? problem.title ?? res.statusText);
    }
  }

  return new ApiError(res.status, res.statusText || `Request failed (${res.status})`);
}

async function send(path: string, init: RequestInit, body?: unknown): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) headers.set('Content-Type', 'application/json');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'omit',
    body: body === undefined ? init.body : JSON.stringify(body),
  });

  if (res.status === 401) {
    onUnauthorized();
    throw new ApiError(401, 'Your session expired. Please sign in again.');
  }
  if (!res.ok) throw await toApiError(res);

  return res;
}

async function request<T>(path: string, init: RequestInit = {}, body?: unknown): Promise<T> {
  const res = await send(path, init, body);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST' }, body ?? {}),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT' }, body),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH' }, body),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  /** Devuelve null cuando el servidor responde 204 (nada que descargar). */
  async blob(path: string, method: 'GET' | 'POST' = 'POST'): Promise<Blob | null> {
    const res = await send(path, { method });
    if (res.status === 204) return null;
    return res.blob();
  },
};

export function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value.trim() !== '') search.set(key, value);
  });
  const query = search.toString();
  return query === '' ? '' : `?${query}`;
}
