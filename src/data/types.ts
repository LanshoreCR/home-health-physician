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

/** Ya entró a HCHB: el único estado desde el que se puede marcar COMPLETED. */
export const IMPORTED: RequestStatus = 'imported';

/**
 * El final del camino: la request ya quedó cargada en el chart del paciente.
 * Solo se llega desde IMPORTED, y la lista la esconde salvo que un reviewer
 * filtre por ella.
 */
export const COMPLETED: RequestStatus = 'completed';

/** States that fire a response back to the requester. */
export const TRIGGER_STATUSES: RequestStatus[] = ['denied', 'approved'];

export type StatusFilter = 'all' | RequestStatus;
