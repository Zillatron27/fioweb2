import type { GroupDetailResponse, InviteResponseWire, InviteResponse, CreateGroupRequest, CreateGroupResponse, InviteUsersRequest, GroupWithRole } from '../types/groups';
import { apiGet, apiPost, apiPut, apiDelete } from './client';
import { USE_MOCK, MOCK_GROUPS_ALL, MOCK_GROUPS_OWNED, MOCK_GROUPS_ADMIN, MOCK_GROUPS_MEMBER, MOCK_INVITES } from './mock';

let mockGroups = [...MOCK_GROUPS_ALL];
let mockOwned = [...MOCK_GROUPS_OWNED];
let mockAdmin = [...MOCK_GROUPS_ADMIN];
let mockMember = [...MOCK_GROUPS_MEMBER];
let mockInvites = [...MOCK_INVITES];

export function listGroups(): Promise<GroupDetailResponse[]> {
  if (USE_MOCK) return Promise.resolve(mockGroups);
  return apiGet<GroupDetailResponse[]>('/group/list');
}

export function listGroupsOwner(): Promise<GroupDetailResponse[]> {
  if (USE_MOCK) return Promise.resolve(mockOwned);
  return apiGet<GroupDetailResponse[]>('/group/list/owner');
}

export function listGroupsAdmin(): Promise<GroupDetailResponse[]> {
  if (USE_MOCK) return Promise.resolve(mockAdmin);
  return apiGet<GroupDetailResponse[]>('/group/list/admin');
}

export function listGroupsMember(): Promise<GroupDetailResponse[]> {
  if (USE_MOCK) return Promise.resolve(mockMember);
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
  if (USE_MOCK) {
    const found = mockGroups.find((g) => g.GroupId === groupId);
    return found ? Promise.resolve(found) : Promise.reject(new Error('Group not found'));
  }
  return apiGet<GroupDetailResponse>(`/group/${groupId}`);
}

export function createGroup(req: CreateGroupRequest): Promise<CreateGroupResponse> {
  if (USE_MOCK) {
    const id = req.RequestedId || Math.floor(Math.random() * 9000) + 1000;
    const newGroup: GroupDetailResponse = {
      GroupId: id,
      GroupName: req.GroupName,
      Permissions: req.Permissions,
    };
    mockGroups = [...mockGroups, newGroup];
    mockOwned = [...mockOwned, newGroup];
    return Promise.resolve({ GroupId: id });
  }
  return apiPost<CreateGroupResponse>('/group/create', req);
}

export function inviteUsers(req: InviteUsersRequest): Promise<void> {
  if (USE_MOCK) return Promise.resolve();
  return apiPost<void>('/group/invite', req);
}

/** Fetch pending invites, normalizing the triple-s typo. */
export async function listInvites(): Promise<InviteResponse[]> {
  if (USE_MOCK) return mockInvites;
  const wire = await apiGet<InviteResponseWire[]>('/group/list/invite');
  return wire.map((w) => ({
    GroupId: w.GroupId,
    GroupName: w.GroupName,
    Admin: w.Admin,
    Permissions: w.Permisssions,
  }));
}

export function acceptInvite(groupId: number): Promise<void> {
  if (USE_MOCK) {
    const invite = mockInvites.find((i) => i.GroupId === groupId);
    if (invite) {
      const newGroup: GroupDetailResponse = {
        GroupId: invite.GroupId,
        GroupName: invite.GroupName,
        Permissions: invite.Permissions,
      };
      mockGroups = [...mockGroups, newGroup];
      if (invite.Admin) {
        mockAdmin = [...mockAdmin, newGroup];
      } else {
        mockMember = [...mockMember, newGroup];
      }
      mockInvites = mockInvites.filter((i) => i.GroupId !== groupId);
    }
    return Promise.resolve();
  }
  return apiPut<void>(`/group/invite/accept/${groupId}`, {});
}

export function rejectInvite(groupId: number): Promise<void> {
  if (USE_MOCK) {
    mockInvites = mockInvites.filter((i) => i.GroupId !== groupId);
    return Promise.resolve();
  }
  return apiPut<void>(`/group/invite/reject/${groupId}`, {});
}

export function leaveGroup(groupId: number): Promise<void> {
  if (USE_MOCK) {
    mockGroups = mockGroups.filter((g) => g.GroupId !== groupId);
    mockAdmin = mockAdmin.filter((g) => g.GroupId !== groupId);
    mockMember = mockMember.filter((g) => g.GroupId !== groupId);
    return Promise.resolve();
  }
  return apiPut<void>(`/group/leave/${groupId}`, {});
}

export function kickMember(groupId: number, userName: string): Promise<void> {
  if (USE_MOCK) return Promise.resolve();
  return apiPut<void>(`/group/kick/${groupId}/${encodeURIComponent(userName)}`, {});
}

export function promoteMember(groupId: number, userName: string): Promise<void> {
  if (USE_MOCK) return Promise.resolve();
  return apiPut<void>(`/group/promote/${groupId}/${encodeURIComponent(userName)}`, {});
}

export function deleteGroup(groupId: number): Promise<void> {
  if (USE_MOCK) {
    mockGroups = mockGroups.filter((g) => g.GroupId !== groupId);
    mockOwned = mockOwned.filter((g) => g.GroupId !== groupId);
    return Promise.resolve();
  }
  return apiDelete(`/group/delete/${groupId}`);
}
