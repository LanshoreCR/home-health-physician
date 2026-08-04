import { api } from './client';
import { lookupsSchema, parseResponse } from './schemas';
import type { Lookups } from './schemas';

export async function getLookups(signal?: AbortSignal): Promise<Lookups> {
  const data = await api.get<unknown>('/lookups', signal);
  return parseResponse(lookupsSchema, data, 'getLookups');
}
