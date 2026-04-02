export interface RetrievalResponse<T> {
  UserNameToData: Record<string, { Errors: string[]; Data: T | null }>;
}

export interface Site {
  SiteId: string;
  LocationNaturalId: string;
  LocationName: string;
  Timestamp: string;
}

export interface Workforce {
  SiteId: string;
  Timestamp: string;
}

export interface Ship {
  ShipId: string;
  Name: string;
  Registration: string;
  CurrentLocationName: string | null;
  CurrentLocationNaturalId: string | null;
  Timestamp: string;
}

export interface StorageEntry {
  StorageId: string;
  Name: string;
  LocationName: string;
  LocationNaturalId: string;
  Type: string;
  Timestamp: string;
}

export interface Flight {
  FlightId: string;
  OriginName: string;
  DestinationName: string;
  Timestamp: string;
}

export interface ProductionLine {
  ProductionLineId: string;
  LocationName: string;
  BuildingTicker: string;
  Timestamp: string;
}

export interface Contract {
  Id: string;
  PartnerName: string;
  Status: string;
  Timestamp: string;
}

export interface CxOrder {
  OrderId: string;
  MaterialTicker: string;
  ExchangeCode: string;
  OrderType: string;
  Timestamp: string;
}

export interface CompanyData {
  Name: string;
  Code: string;
  CountryCode: string;
  CountryName: string;
  Timestamp: string;
}

/** Composite response from GET /data with all includes. Field names match actual API response. */
export interface AllData {
  Company: CompanyData | null;
  Contracts: Contract[];
  CXOSs: CxOrder[];
  ProductionLines: ProductionLine[];
  Ships: Ship[];
  Flights: Flight[];
  Sites: Site[];
  Storages: StorageEntry[];
  Workforces: Workforce[];
}
