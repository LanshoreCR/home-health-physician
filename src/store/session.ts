import { create } from 'zustand';
import { APP_ROLES } from '../auth/roles';
import type { CurrentUser } from '../api/schemas';

interface SessionState {
  user: CurrentUser | null;
  setUser: (user: CurrentUser) => void;
}

/**
 * El usuario autenticado y sus roles. A diferencia de useCatalogsStore no se
 * persiste: un rol cacheado en localStorage sobreviviría a que lo saquen del
 * grupo de seguridad, y pintaría acciones que el API va a rechazar igual.
 */
export const useSessionStore = create<SessionState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function hasAccess(user: CurrentUser | null): boolean {
  if (!user) return false;
  return user.roles.some((role) => role === APP_ROLES.USER || role === APP_ROLES.REVIEWER);
}
