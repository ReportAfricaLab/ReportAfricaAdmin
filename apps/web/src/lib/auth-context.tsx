'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // refresh when < 5 min left
const TIMER_INTERVAL_MS = 60 * 1000;         // check every 60s

interface User {
  id: string;
  email: string;
  username: string;
  country: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  handleSessionExpiry: () => void;
  isAuthenticated: boolean;
  getValidToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  handleSessionExpiry: () => {},
  isAuthenticated: false,
  getValidToken: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Refresh token lives in memory only — never localStorage
  const refreshTokenRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate access token + user from localStorage on mount (refresh token comes via httpOnly cookie)
  useEffect(() => {
    const savedToken = localStorage.getItem('ra_token');
    const savedUser = localStorage.getItem('ra_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const silentRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const rt = refreshTokenRef.current;
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send body token if available, cookie sent automatically via credentials
        body: JSON.stringify({ refreshToken: rt || '' }),
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('ra_token', data.token);
        // Store new rotated refresh token in memory only
        if (data.refreshToken) refreshTokenRef.current = data.refreshToken;
        return data.token;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const handleSessionExpiry = useCallback(() => {
    if (typeof window === 'undefined') return;
    // Preserve return URL in sessionStorage
    const returnTo = window.location.pathname + window.location.search;
    if (returnTo !== '/login' && returnTo !== '/register') {
      sessionStorage.setItem('ra_return_to', returnTo);
    }
    // Wipe auth state
    setUser(null);
    setToken(null);
    refreshTokenRef.current = null;
    localStorage.removeItem('ra_token');
    localStorage.removeItem('ra_user');
    // Blacklist on backend (fire and forget)
    fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: '' }), credentials: 'include' }).catch(() => {});
    window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  }, []);

  // Background refresh timer — starts when token is set, clears on logout
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!token) return;

    timerRef.current = setInterval(async () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresIn = payload.exp * 1000 - Date.now();
        if (expiresIn < REFRESH_THRESHOLD_MS) {
          const newToken = await silentRefresh();
          if (!newToken) handleSessionExpiry();
        }
      } catch {
        // Malformed token — expire session
        handleSessionExpiry();
      }
    }, TIMER_INTERVAL_MS);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [token, silentRefresh, handleSessionExpiry]);

  const login = useCallback((user: User, token: string, refreshToken: string) => {
    setUser(user);
    setToken(token);
    refreshTokenRef.current = refreshToken; // memory only
    localStorage.setItem('ra_token', token);
    localStorage.setItem('ra_user', JSON.stringify(user));
    // Do NOT write refreshToken to localStorage
  }, []);

  const logout = useCallback(async () => {
    const rt = refreshTokenRef.current;
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt || '' }),
        credentials: 'include',
      });
    } catch {}
    setUser(null);
    setToken(null);
    refreshTokenRef.current = null;
    localStorage.removeItem('ra_token');
    localStorage.removeItem('ra_user');
  }, []);

  // On-demand token getter — used by api.ts as fallback
  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = payload.exp * 1000 - Date.now();
      if (expiresIn < REFRESH_THRESHOLD_MS) {
        const newToken = await silentRefresh();
        if (!newToken) { handleSessionExpiry(); return null; }
        return newToken;
      }
    } catch {}
    return token;
  }, [token, silentRefresh, handleSessionExpiry]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, handleSessionExpiry, isAuthenticated: !!token, getValidToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
