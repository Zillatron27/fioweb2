import type { LoginRequest, LoginResponse, RegisterRequest, ChangePasswordRequest } from '../types/auth';
import { apiPost, apiGet, apiGetText, apiPostVoid } from './client';

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

let cachedUsers: string[] | null = null;

/** Fetch all FIO usernames. Cached — the list won't change during a session. */
export async function getUsers(): Promise<string[]> {
  if (cachedUsers) return cachedUsers;
  cachedUsers = await apiGet<string[]>('/auth/users');
  return cachedUsers;
}
