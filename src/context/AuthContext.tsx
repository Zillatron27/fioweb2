import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthSession } from '../types/auth';
import { setAuthToken, setOnUnauthorized } from '../api/client';
import { USE_MOCK } from '../api/mock';

const MOCK_SESSION: AuthSession = {
  username: 'MockUser',
  token: 'mock-jwt-token',
  isAdmin: false,
};

interface AuthContextValue {
  username: string | null;
  token: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (username: string, token: string, isAdmin: boolean) => void;
  logout: () => void;
}

const STORAGE_KEY = 'fioweb-session';

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed.username && parsed.token) return parsed;
    return null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(
    USE_MOCK ? MOCK_SESSION : loadSession,
  );

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    navigate('/login');
  }, [navigate]);

  const login = useCallback((username: string, token: string, isAdmin: boolean) => {
    const next: AuthSession = { username, token, isAdmin };
    setSession(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAuthToken(token);
  }, []);

  // Sync token to API client on mount and session change
  useEffect(() => {
    setAuthToken(session?.token ?? null);
  }, [session]);

  // Register the 401 handler
  useEffect(() => {
    setOnUnauthorized(() => {
      setSession(null);
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
      navigate('/login');
    });
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        username: session?.username ?? null,
        token: session?.token ?? null,
        isAdmin: session?.isAdmin ?? false,
        isAuthenticated: session !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
