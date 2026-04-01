export interface LoginRequest {
  UserName: string;
  Password: string;
}

export interface LoginResponse {
  Token: string;
  IsAdministrator: boolean;
}

export interface RegisterRequest {
  UserName: string;
  Password: string;
  RegistrationGuid: string;
}

export interface ChangePasswordRequest {
  OldPassword: string;
  NewPassword: string;
}

export interface AuthSession {
  username: string;
  token: string;
  isAdmin: boolean;
}
