import type { RequestStatus } from '../data/types';

export const APP_ROLES = {
  USER: 'User',
  REVIEWER: 'Reviewer',
  NO_ACCESS: 'No Access',
} as const;

/**
 * Espejo de RequestStatuses.IsFinal del backend: una request ya revisada solo
 * la puede editar un Reviewer. Si allá cambia, hay que cambiarla acá también.
 */
export const FINAL_STATUSES: RequestStatus[] = ['approved', 'denied'];
