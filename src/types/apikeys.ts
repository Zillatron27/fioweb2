export interface APIKey {
  Key: string;
  UserName: string;
  Application: string;
  AllowWrites: boolean;
  CreateTime: string;
}

export interface CreateAPIKeyRequest {
  UserName: string;
  Password: string;
  ApplicationName: string;
  AllowWrites: boolean;
}

export interface CreateAPIKeyResponse {
  APIKey: string;
}

export interface RevokeAPIKeyRequest {
  UserName: string;
  Password: string;
  APIKeyToRevoke: string;
}
