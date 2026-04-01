export interface ShipPermissions {
  ShipInformation: boolean;
  ShipRepair: boolean;
  ShipFlight: boolean;
  ShipInventory: boolean;
  ShipFuelInventory: boolean;
}

export interface SitesPermissions {
  SitesLocation: boolean;
  SitesWorkforces: boolean;
  SitesExperts: boolean;
  SitesBuildings: boolean;
  SitesRepair: boolean;
  SitesReclaimable: boolean;
  SitesProductionLines: boolean;
}

export interface StoragePermissions {
  StorageLocation: boolean;
  StorageInformation: boolean;
  StorageItems: boolean;
}

export interface TradePermissions {
  TradeContract: boolean;
  TradeCXOS: boolean;
}

export interface CompanyPermissions {
  CompanyInfo: boolean;
  CompanyLiquidCurrency: boolean;
  CompanyHeadquarters: boolean;
}

export interface MiscPermissions {
  MiscShipmentTracking: boolean;
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
      ShipInformation: false,
      ShipRepair: false,
      ShipFlight: false,
      ShipInventory: false,
      ShipFuelInventory: false,
    },
    SitesPermissions: {
      SitesLocation: false,
      SitesWorkforces: false,
      SitesExperts: false,
      SitesBuildings: false,
      SitesRepair: false,
      SitesReclaimable: false,
      SitesProductionLines: false,
    },
    StoragePermissions: {
      StorageLocation: false,
      StorageInformation: false,
      StorageItems: false,
    },
    TradePermissions: {
      TradeContract: false,
      TradeCXOS: false,
    },
    CompanyPermissions: {
      CompanyInfo: false,
      CompanyLiquidCurrency: false,
      CompanyHeadquarters: false,
    },
    MiscPermissions: {
      MiscShipmentTracking: false,
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
