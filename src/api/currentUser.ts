import { api } from './client';
import { currentUserSchema, parseResponse } from './schemas';
import type { CurrentUser } from './schemas';

export async function getCurrentUser(signal?: AbortSignal): Promise<CurrentUser> {
  const data = await api.get<unknown>('/users/me', signal);
  return parseResponse(currentUserSchema, data, 'getCurrentUser');
}
