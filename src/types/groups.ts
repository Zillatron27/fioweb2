import type { Permissions } from './permissions';

export interface GroupDetailResponse {
  GroupId: number;
  GroupName: string;
  Permissions: Permissions;
}

/** Wire format from GET /group/list/invite — note the triple-s typo. */
export interface InviteResponseWire {
  GroupId: number;
  GroupName: string;
  Admin: boolean;
  Permisssions: Permissions;
}

/** Normalized invite response with corrected field name. */
export interface InviteResponse {
  GroupId: number;
  GroupName: string;
  Admin: boolean;
  Permissions: Permissions;
}

export interface GroupInvite {
  UserName: string;
  Admin: boolean;
}

export interface CreateGroupRequest {
  RequestedId: number;
  GroupName: string;
  Invites: GroupInvite[];
  Permissions: Permissions;
}

export interface CreateGroupResponse {
  GroupId: number;
}

export interface InviteUsersRequest {
  GroupId: number;
  Invites: GroupInvite[];
}

export type GroupRole = 'owner' | 'admin' | 'member';

/** Enriched group with role info, built by cross-referencing role-specific list endpoints. */
export interface GroupWithRole extends GroupDetailResponse {
  role: GroupRole;
}
