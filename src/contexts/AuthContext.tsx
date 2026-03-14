import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, clearToken, parseJwt } from '@/lib/api';
import { toast } from 'sonner';

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student';

interface User {
  uid: string;
  tid?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({ uid: payload.uid, tid: payload.tid, role: payload.role });
      } else {
        clearToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password);
    setToken(res.token);
    const payload = parseJwt(res.token);
    setUser({ uid: payload.uid, tid: payload.tid, role: payload.role });
    toast.success('Login successful');
    // Navigate to dashboard after login (clear any stale URL)
    window.history.replaceState(null, '', '/dashboard');
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    toast.success('Logged out');
    // Reset URL to root so next login goes to dashboard
    window.history.replaceState(null, '', '/');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
