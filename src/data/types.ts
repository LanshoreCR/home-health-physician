export type {
  PhysicianRequest,
  PhysicianRequestListItem,
  RequestDraft,
  RequestStatus,
} from '../api/schemas';

import type { RequestStatus } from '../api/schemas';

/** Clean states whose requests are ready to export to HCHB. */
export const EXPORTABLE_STATUSES: RequestStatus[] = ['newreq', 'modify', 'approved'];

/** States that fire a response back to the requester. */
export const TRIGGER_STATUSES: RequestStatus[] = ['denied', 'approved'];

export type StatusFilter = 'all' | RequestStatus;
