import type { APIKey, CreateAPIKeyRequest, CreateAPIKeyResponse, RevokeAPIKeyRequest } from '../types/apikeys';
import { apiGet, apiPost, apiPostVoid } from './client';
import { USE_MOCK, MOCK_API_KEYS, MOCK_CREATE_KEY } from './mock';

let mockKeys = [...MOCK_API_KEYS];

export function listApiKeys(): Promise<APIKey[]> {
  if (USE_MOCK) return Promise.resolve(mockKeys);
  return apiGet<APIKey[]>('/auth/listapikeys');
}

export function createApiKey(req: CreateAPIKeyRequest): Promise<CreateAPIKeyResponse> {
  if (USE_MOCK) {
    const newKey: APIKey = {
      Key: MOCK_CREATE_KEY.APIKey,
      UserName: req.UserName,
      Application: req.ApplicationName,
      AllowWrites: req.AllowWrites,
      CreateTime: new Date().toISOString(),
    };
    mockKeys = [...mockKeys, newKey];
    return Promise.resolve(MOCK_CREATE_KEY);
  }
  return apiPost<CreateAPIKeyResponse>('/auth/createapikey', req);
}

export function revokeApiKey(req: RevokeAPIKeyRequest): Promise<void> {
  if (USE_MOCK) {
    mockKeys = mockKeys.filter((k) => k.Key !== req.APIKeyToRevoke);
    return Promise.resolve();
  }
  return apiPostVoid('/auth/revokeapikey', req);
}
