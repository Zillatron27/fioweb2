import type { LoginRequest, LoginResponse, RegisterRequest, ChangePasswordRequest } from '../types/auth';
import { apiPost, apiGet, apiGetText, apiPostVoid, apiPut, apiDelete } from './client';

export function login(req: LoginRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', req);
}

export function register(req: RegisterRequest): Promise<void> {
  return apiPostVoid('/auth/register', req);
}

export function changePassword(req: ChangePasswordRequest): Promise<void> {
  return apiPostVoid('/auth/changepassword', req);
}

export function getDiscordName(): Promise<string> {
  return apiGetText('/auth/discord');
}

export function updateDiscordName(name: string): Promise<void> {
  return apiPut<void>('/auth/discord', { DiscordName: name });
}

export function setAnonymousDataCollection(allow: boolean): Promise<void> {
  return apiPostVoid('/auth/anonymousdatacollection', { AllowAnonymousDataCollection: allow });
}

export function resetGameData(categories: Record<string, boolean>): Promise<void> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(categories)) {
    params.set(key, String(value));
  }
  return apiDelete(`/auth/resetgamedata?${params.toString()}`);
}

export function deleteAccount(password: string): Promise<void> {
  return apiPostVoid('/auth/deleteaccount', { Password: password });
}

let cachedUsers: string[] | null = null;

/** Fetch all FIO usernames. Cached — the list won't change during a session. */
export async function getUsers(): Promise<string[]> {
  if (cachedUsers) return cachedUsers;
  cachedUsers = await apiGet<string[]>('/auth/users');
  return cachedUsers;
}
