import type { APIKey, CreateAPIKeyRequest, CreateAPIKeyResponse, RevokeAPIKeyRequest } from '../types/apikeys';
import { apiGet, apiPost, apiPostVoid } from './client';

export function listApiKeys(): Promise<APIKey[]> {
  return apiGet<APIKey[]>('/auth/listapikeys');
}

export function createApiKey(req: CreateAPIKeyRequest): Promise<CreateAPIKeyResponse> {
  return apiPost<CreateAPIKeyResponse>('/auth/createapikey', req);
}

export function revokeApiKey(req: RevokeAPIKeyRequest): Promise<void> {
  return apiPostVoid('/auth/revokeapikey', req);
}
