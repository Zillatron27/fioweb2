import type { LoginRequest, LoginResponse, RegisterRequest, ChangePasswordRequest } from '../types/auth';
import { apiPost, apiGet, apiGetText, apiPostVoid } from './client';
import { USE_MOCK, MOCK_LOGIN, MOCK_DISCORD, MOCK_USERS } from './mock';

export function login(req: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) return Promise.resolve(MOCK_LOGIN);
  return apiPost<LoginResponse>('/auth/login', req);
}

export function register(req: RegisterRequest): Promise<void> {
  if (USE_MOCK) return Promise.resolve();
  return apiPostVoid('/auth/register', req);
}

export function changePassword(req: ChangePasswordRequest): Promise<void> {
  if (USE_MOCK) return Promise.resolve();
  return apiPostVoid('/auth/changepassword', req);
}

export function getDiscordName(): Promise<string> {
  if (USE_MOCK) return Promise.resolve(MOCK_DISCORD);
  return apiGetText('/auth/discord');
}

let cachedUsers: string[] | null = null;

/** Fetch all FIO usernames. Cached — the list won't change during a session. */
export async function getUsers(): Promise<string[]> {
  if (USE_MOCK) return MOCK_USERS;
  if (cachedUsers) return cachedUsers;
  cachedUsers = await apiGet<string[]>('/auth/users');
  return cachedUsers;
}
