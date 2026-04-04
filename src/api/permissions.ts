import type { PermissionResponse, GrantPermissionRequest } from '../types/permissions';
import { apiGet, apiGetText, apiPut, apiDelete } from './client';

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
  try {
    await apiGetText(`/permission/groupidavailable/${groupId}`);
    return true;
  } catch {
    return false;
  }
}
