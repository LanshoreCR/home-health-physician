export type {
  PhysicianRequest,
  PhysicianRequestListItem,
  RequestDraft,
  RequestStatus,
} from '../api/schemas';

import type { RequestStatus } from '../api/schemas';

/**
 * Espejo de BHS_HHP_REF_RequestStatus.IsExportable, que /lookups todavía no
 * expone: si allá cambia el flag, hay que cambiar esta lista también.
 */
export const EXPORTABLE_STATUSES: RequestStatus[] = ['approved'];

/** States that fire a response back to the requester. */
export const TRIGGER_STATUSES: RequestStatus[] = ['denied', 'approved'];

export type StatusFilter = 'all' | RequestStatus;
