import { apiGetText, apiPost, apiDelete } from './client';

export interface CreateAccountRequest {
  UserName: string;
  Password: string;
  Admin: boolean;
  Bot: boolean;
}

/** Check if a username exists. Returns true (200) or false (204). */
export async function checkUser(username: string): Promise<boolean> {
  const text = await apiGetText(`/admin/isuser/${encodeURIComponent(username)}`);
  return text.length > 0;
}

export function createAccount(req: CreateAccountRequest): Promise<void> {
  return apiPost<void>('/admin/createaccount', req);
}

export function adminDeleteAccount(username: string): Promise<void> {
  return apiDelete(`/admin/deleteaccount/${encodeURIComponent(username)}`);
}

export type AdminClearTarget =
  | 'clearcxdata'
  | 'clearchatdata'
  | 'clearbuidata'
  | 'clearmatdata'
  | 'clearjumpcache'
  | 'clearstationdata'
  | 'clearmapdata';

export function clearAdminData(target: AdminClearTarget): Promise<void> {
  return apiDelete(`/admin/${target}`);
}
