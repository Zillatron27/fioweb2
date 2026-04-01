import type { PermissionResponse, GrantPermissionRequest } from '../types/permissions';
import { apiGet, apiPut, apiDelete } from './client';
import { USE_MOCK, MOCK_MY_GRANTS, MOCK_RECEIVED_GRANTS } from './mock';

let mockGrants = [...MOCK_MY_GRANTS];

export function getMyGrants(): Promise<PermissionResponse[]> {
  if (USE_MOCK) return Promise.resolve(mockGrants);
  return apiGet<PermissionResponse[]>('/permission');
}

export function getGrantedToMe(): Promise<PermissionResponse[]> {
  if (USE_MOCK) return Promise.resolve(MOCK_RECEIVED_GRANTS);
  return apiGet<PermissionResponse[]>('/permission/granted');
}

export function grantPermission(req: GrantPermissionRequest): Promise<void> {
  if (USE_MOCK) {
    const existing = mockGrants.findIndex(
      (g) => g.GranteeUserName === req.UserName && g.GroupId === 0,
    );
    const entry: PermissionResponse = {
      GrantorUserName: 'MockUser',
      GranteeUserName: req.UserName,
      GroupId: 0,
      Permissions: req.Permissions,
    };
    if (existing >= 0) {
      mockGrants[existing] = entry;
    } else {
      mockGrants = [...mockGrants, entry];
    }
    return Promise.resolve();
  }
  return apiPut<void>('/permission/grant', req);
}

export function revokePermission(grantee: string): Promise<void> {
  if (USE_MOCK) {
    mockGrants = mockGrants.filter((g) => g.GranteeUserName !== grantee);
    return Promise.resolve();
  }
  return apiDelete(`/permission/revoke/${encodeURIComponent(grantee)}`);
}

export async function isGroupIdAvailable(groupId: number): Promise<boolean> {
  if (USE_MOCK) return groupId > 1000;
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? 'https://api.fnar.net'}/permission/groupidavailable/${groupId}`,
  );
  return response.status === 200;
}
