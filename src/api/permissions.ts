import type { PermissionResponse, GrantPermissionRequest } from '../types/permissions';
import { apiGet, apiPut, apiDelete } from './client';

export function getMyGrants(): Promise<PermissionResponse[]> {
  return apiGet<PermissionResponse[]>('/permission');
}

export function getGrantedToMe(): Promise<PermissionResponse[]> {
  return apiGet<PermissionResponse[]>('/permission/granted');
}

export function grantPermission(req: GrantPermissionRequest): Promise<void> {
  return apiPut<void>('/permission/grant', req);
}

export function revokePermission(grantee: string): Promise<void> {
  return apiDelete(`/permission/revoke/${encodeURIComponent(grantee)}`);
}

export async function isGroupIdAvailable(groupId: number): Promise<boolean> {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? 'https://api.fnar.net'}/permission/groupidavailable/${groupId}`,
  );
  return response.status === 200;
}
