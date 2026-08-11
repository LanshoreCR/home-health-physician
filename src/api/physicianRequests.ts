import { api, buildQuery } from './client';
import {
  branchesSchema,
  createdSchema,
  parseResponse,
  physicianRequestListSchema,
  physicianRequestSchema,
  setStatusResultSchema,
  toSaveBody,
} from './schemas';
import type {
  PhysicianRequest,
  PhysicianRequestList,
  RequestDraft,
  RequestStatus,
  SetStatusResult,
} from './schemas';
import type { StatusFilter } from '../data/types';

const PATH = '/physicianrequests';

export interface ListFilters {
  search?: string;
  status?: StatusFilter;
  branch?: string;
}

/** 'all' no se manda: el proc hace match exacto y devolvería cero filas. */
function omitAll(value: string | undefined): string | undefined {
  return value === 'all' ? undefined : value;
}

export async function listRequests(
  filters: ListFilters,
  signal?: AbortSignal,
): Promise<PhysicianRequestList> {
  const query = buildQuery({
    search: filters.search,
    status: omitAll(filters.status),
    branch: omitAll(filters.branch),
  });
  const data = await api.get<unknown>(`${PATH}${query}`, signal);
  return parseResponse(physicianRequestListSchema, data, 'listRequests');
}

export async function getRequest(id: number, signal?: AbortSignal): Promise<PhysicianRequest> {
  const data = await api.get<unknown>(`${PATH}/${id}`, signal);
  return parseResponse(physicianRequestSchema, data, 'getRequest');
}

export async function createRequest(draft: RequestDraft): Promise<number> {
  const data = await api.post<unknown>(PATH, toSaveBody(draft));
  return parseResponse(createdSchema, data, 'createRequest').id;
}

export async function updateRequest(id: number, draft: RequestDraft): Promise<void> {
  await api.put<unknown>(`${PATH}/${id}`, toSaveBody(draft));
}

export async function setRequestStatus(
  id: number,
  status: RequestStatus,
): Promise<SetStatusResult> {
  const data = await api.patch<unknown>(`${PATH}/${id}/status`, { status });
  return parseResponse(setStatusResultSchema, data, 'setRequestStatus');
}

export async function deleteRequest(id: number): Promise<void> {
  await api.del<unknown>(`${PATH}/${id}`);
}

export async function listBranches(signal?: AbortSignal): Promise<string[]> {
  const data = await api.get<unknown>(`${PATH}/branches`, signal);
  return parseResponse(branchesSchema, data, 'listBranches');
}
