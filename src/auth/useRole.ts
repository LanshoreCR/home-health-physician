import { useSessionStore } from '../store/session';
import { APP_ROLES, FINAL_STATUSES } from './roles';
import type { PhysicianRequest } from '../data/types';

export interface Permissions {
  isReviewer: boolean;
  isUser: boolean;
  canCreate: boolean;
  canSetStatus: boolean;
  canExport: boolean;
  canDelete: boolean;
  canEdit: (request: PhysicianRequest) => boolean;
}

/**
 * Espejo de las políticas del API. Acá solo se decide qué se pinta: lo que
 * de verdad protege es el 403 del backend, este hook evita ofrecer un botón
 * que va a fallar.
 */
export function useRole(): Permissions {
  const roles = useSessionStore((state) => state.user?.roles);

  const isReviewer = roles?.includes(APP_ROLES.REVIEWER) ?? false;
  const isUser = (roles?.includes(APP_ROLES.USER) ?? false) && !isReviewer;

  return {
    isReviewer,
    isUser,
    canCreate: isReviewer || isUser,
    canSetStatus: isReviewer,
    canExport: isReviewer,
    canDelete: isReviewer,
    canEdit: (request) => isReviewer || (isUser && !FINAL_STATUSES.includes(request.status)),
  };
}
