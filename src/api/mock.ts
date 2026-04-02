import type { LoginResponse } from '../types/auth';
import type { APIKey, CreateAPIKeyResponse } from '../types/apikeys';
import type { PermissionResponse, Permissions } from '../types/permissions';
import { emptyPermissions } from '../types/permissions';
import type { GroupDetailResponse, InviteResponse } from '../types/groups';

/** Set to true to use mock data instead of the real API. */
export const USE_MOCK = false;

function mockPerms(overrides: Partial<Record<string, boolean>> = {}): Permissions {
  const p = emptyPermissions();
  if (overrides.ships) {
    p.ShipPermissions.Information = true;
    p.ShipPermissions.Flight = true;
    p.ShipPermissions.Inventory = true;
  }
  if (overrides.sites) {
    p.SitesPermissions.Location = true;
    p.SitesPermissions.Buildings = true;
    p.SitesPermissions.ProductionLines = true;
  }
  if (overrides.storage) {
    p.StoragePermissions.Location = true;
    p.StoragePermissions.Information = true;
    p.StoragePermissions.Items = true;
  }
  if (overrides.trade) {
    p.TradePermissions.Contract = true;
    p.TradePermissions.CXOS = true;
  }
  if (overrides.company) {
    p.CompanyPermissions.Info = true;
  }
  if (overrides.all) {
    for (const cat of Object.values(p)) {
      for (const key of Object.keys(cat)) {
        (cat as Record<string, boolean>)[key] = true;
      }
    }
  }
  return p;
}

export const MOCK_LOGIN: LoginResponse = {
  Token: 'mock-jwt-token-abc123',
  IsAdministrator: false,
};

export const MOCK_DISCORD = 'MockUser#1234';

export const MOCK_USERS: string[] = [
  'Bombardier',
  'Catharina',
  'DarkMatter',
  'Esteri',
  'Foenix',
  'Greenfoot',
  'Harvester',
  'Ionwave',
  'Juniper',
  'Kovus',
  'Lundgren',
  'Morituri',
  'NovaStar',
  'Prdgi',
  'Rubicon',
  'Saganaki',
  'Tevarin',
  'Umbra',
  'Voltaire',
  'Wayfinder',
];

export const MOCK_API_KEYS: APIKey[] = [
  {
    Key: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    UserName: 'MockUser',
    Application: 'Helm',
    AllowWrites: false,
    CreateTime: '2026-01-15T10:30:00Z',
  },
  {
    Key: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    UserName: 'MockUser',
    Application: 'My Spreadsheet',
    AllowWrites: false,
    CreateTime: '2026-02-20T14:45:00Z',
  },
  {
    Key: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    UserName: 'MockUser',
    Application: 'APXM Mobile',
    AllowWrites: true,
    CreateTime: '2026-03-10T08:00:00Z',
  },
];

export const MOCK_CREATE_KEY: CreateAPIKeyResponse = {
  APIKey: 'd4e5f6a7-b8c9-0123-defa-234567890123',
};

export const MOCK_MY_GRANTS: PermissionResponse[] = [
  {
    GrantorUserName: 'MockUser',
    GranteeUserName: 'Bombardier',
    GroupId: 0,
    Permissions: mockPerms({ ships: true, storage: true }),
  },
  {
    GrantorUserName: 'MockUser',
    GranteeUserName: '*',
    GroupId: 0,
    Permissions: mockPerms({ company: true }),
  },
  {
    GrantorUserName: 'MockUser',
    GranteeUserName: 'Catharina',
    GroupId: 42,
    Permissions: mockPerms({ ships: true, sites: true, trade: true }),
  },
];

export const MOCK_RECEIVED_GRANTS: PermissionResponse[] = [
  {
    GrantorUserName: 'Saganaki',
    GranteeUserName: 'MockUser',
    GroupId: 0,
    Permissions: mockPerms({ all: true }),
  },
  {
    GrantorUserName: 'Kovus',
    GranteeUserName: 'MockUser',
    GroupId: 7,
    Permissions: mockPerms({ ships: true, sites: true }),
  },
];

export const MOCK_GROUPS_OWNED: GroupDetailResponse[] = [
  {
    GroupId: 42,
    GroupName: 'Antares Trading Co',
    Permissions: mockPerms({ ships: true, sites: true, trade: true }),
  },
];

export const MOCK_GROUPS_ADMIN: GroupDetailResponse[] = [
  {
    GroupId: 7,
    GroupName: 'Moria Station Alliance',
    Permissions: mockPerms({ ships: true, sites: true }),
  },
];

export const MOCK_GROUPS_MEMBER: GroupDetailResponse[] = [
  {
    GroupId: 128,
    GroupName: 'Benten Fuel Coop',
    Permissions: mockPerms({ storage: true }),
  },
];

export const MOCK_GROUPS_ALL: GroupDetailResponse[] = [
  ...MOCK_GROUPS_OWNED,
  ...MOCK_GROUPS_ADMIN,
  ...MOCK_GROUPS_MEMBER,
];

export const MOCK_INVITES: InviteResponse[] = [
  {
    GroupId: 256,
    GroupName: 'Promitor Logistics Network',
    Admin: false,
    Permissions: mockPerms({ ships: true, storage: true, trade: true }),
  },
  {
    GroupId: 512,
    GroupName: 'Montem Defence Pact',
    Admin: true,
    Permissions: mockPerms({ all: true }),
  },
];
