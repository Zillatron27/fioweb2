import type { GroupDetailResponse, InviteResponseWire, InviteResponse, CreateGroupRequest, CreateGroupResponse, InviteUsersRequest, GroupWithRole } from '../types/groups';
import { apiGet, apiPost, apiPut, apiDelete } from './client';

export function listGroups(): Promise<GroupDetailResponse[]> {
  return apiGet<GroupDetailResponse[]>('/group/list');
}

export function listGroupsOwner(): Promise<GroupDetailResponse[]> {
  return apiGet<GroupDetailResponse[]>('/group/list/owner');
}

export function listGroupsAdmin(): Promise<GroupDetailResponse[]> {
  return apiGet<GroupDetailResponse[]>('/group/list/admin');
}

export function listGroupsMember(): Promise<GroupDetailResponse[]> {
  return apiGet<GroupDetailResponse[]>('/group/list/member');
}

/** Fetch all groups with role annotations by cross-referencing role-specific lists. */
export async function listGroupsWithRoles(): Promise<GroupWithRole[]> {
  const [owned, admined] = await Promise.all([
    listGroupsOwner(),
    listGroupsAdmin(),
  ]);

  const ownedIds = new Set(owned.map((g) => g.GroupId));
  const adminIds = new Set(admined.map((g) => g.GroupId));

  const all = await listGroups();
  return all.map((g) => ({
    ...g,
    role: ownedIds.has(g.GroupId)
      ? 'owner' as const
      : adminIds.has(g.GroupId)
        ? 'admin' as const
        : 'member' as const,
  }));
}

export function getGroup(groupId: number): Promise<GroupDetailResponse> {
  return apiGet<GroupDetailResponse>(`/group/${groupId}`);
}

export function createGroup(req: CreateGroupRequest): Promise<CreateGroupResponse> {
  return apiPost<CreateGroupResponse>('/group/create', req);
}

export function inviteUsers(req: InviteUsersRequest): Promise<void> {
  return apiPost<void>('/group/invite', req);
}

/** Fetch pending invites, normalizing the triple-s typo. */
export async function listInvites(): Promise<InviteResponse[]> {
  const wire = await apiGet<InviteResponseWire[]>('/group/list/invite');
  return wire.map((w) => ({
    GroupId: w.GroupId,
    GroupName: w.GroupName,
    Admin: w.Admin,
    Permissions: w.Permisssions,
  }));
}

export function acceptInvite(groupId: number): Promise<void> {
  return apiPut<void>(`/group/invite/accept/${groupId}`, {});
}

export function rejectInvite(groupId: number): Promise<void> {
  return apiPut<void>(`/group/invite/reject/${groupId}`, {});
}

export function leaveGroup(groupId: number): Promise<void> {
  return apiPut<void>(`/group/leave/${groupId}`, {});
}

export function kickMember(groupId: number, userName: string): Promise<void> {
  return apiPut<void>(`/group/kick/${groupId}/${encodeURIComponent(userName)}`, {});
}

export function promoteMember(groupId: number, userName: string): Promise<void> {
  return apiPut<void>(`/group/promote/${groupId}/${encodeURIComponent(userName)}`, {});
}

export function deleteGroup(groupId: number): Promise<void> {
  return apiDelete(`/group/delete/${groupId}`);
}
