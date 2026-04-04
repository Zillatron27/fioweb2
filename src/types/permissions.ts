export interface ShipPermissions {
  Information: boolean;
  Repair: boolean;
  Flight: boolean;
  Inventory: boolean;
  FuelInventory: boolean;
}

export interface SitesPermissions {
  Location: boolean;
  Workforces: boolean;
  Experts: boolean;
  Buildings: boolean;
  Repair: boolean;
  Reclaimable: boolean;
  ProductionLines: boolean;
}

export interface StoragePermissions {
  Location: boolean;
  Information: boolean;
  Items: boolean;
}

export interface TradePermissions {
  Contract: boolean;
  CXOS: boolean;
}

export interface CompanyPermissions {
  Info: boolean;
  LiquidCurrency: boolean;
  Headquarters: boolean;
}

export interface MiscPermissions {
  ShipmentTracking: boolean;
}

export interface Permissions {
  ShipPermissions: ShipPermissions;
  SitesPermissions: SitesPermissions;
  StoragePermissions: StoragePermissions;
  TradePermissions: TradePermissions;
  CompanyPermissions: CompanyPermissions;
  MiscPermissions: MiscPermissions;
}

export interface PermissionResponse {
  GrantorUserName: string;
  GranteeUserName: string;
  GroupId: number;
  Permissions: Permissions;
}

export interface GrantPermissionRequest {
  UserName: string;
  Permissions: Permissions;
}

/** Returns a Permissions object with all fields set to false. */
export function emptyPermissions(): Permissions {
  return {
    ShipPermissions: {
      Information: false,
      Repair: false,
      Flight: false,
      Inventory: false,
      FuelInventory: false,
    },
    SitesPermissions: {
      Location: false,
      Workforces: false,
      Experts: false,
      Buildings: false,
      Repair: false,
      Reclaimable: false,
      ProductionLines: false,
    },
    StoragePermissions: {
      Location: false,
      Information: false,
      Items: false,
    },
    TradePermissions: {
      Contract: false,
      CXOS: false,
    },
    CompanyPermissions: {
      Info: false,
      LiquidCurrency: false,
      Headquarters: false,
    },
    MiscPermissions: {
      ShipmentTracking: false,
    },
  };
}

/** Returns a Permissions object with all fields set to true. */
export function fullPermissions(): Permissions {
  return {
    ShipPermissions: {
      Information: true,
      Repair: true,
      Flight: true,
      Inventory: true,
      FuelInventory: true,
    },
    SitesPermissions: {
      Location: true,
      Workforces: true,
      Experts: true,
      Buildings: true,
      Repair: true,
      Reclaimable: true,
      ProductionLines: true,
    },
    StoragePermissions: {
      Location: true,
      Information: true,
      Items: true,
    },
    TradePermissions: {
      Contract: true,
      CXOS: true,
    },
    CompanyPermissions: {
      Info: true,
      LiquidCurrency: true,
      Headquarters: true,
    },
    MiscPermissions: {
      ShipmentTracking: true,
    },
  };
}

/** Count how many permission booleans are true across all categories. */
export function countEnabled(perms: Permissions): number {
  let count = 0;
  for (const cat of Object.values(perms)) {
    for (const val of Object.values(cat)) {
      if (val) count++;
    }
  }
  return count;
}

/** Count how many permission booleans are true in a single category. */
export function countCategoryEnabled(category: Record<string, boolean>): number {
  return Object.values(category).filter(Boolean).length;
}

/** Total number of permission booleans across all categories. */
export const TOTAL_PERMISSIONS = Object.values(fullPermissions())
  .reduce((sum, cat) => sum + Object.keys(cat).length, 0);
