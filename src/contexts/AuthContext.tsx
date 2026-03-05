import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  uid: string;
  tid?: string;
  role: string;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  user: JwtPayload | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  role: string | null;
  tenantId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<JwtPayload | null>(null);

  const decodeAndSet = useCallback((t: string | null) => {
    if (!t) { setUser(null); return; }
    try {
      const decoded = jwtDecode<JwtPayload>(t);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        return;
      }
      setUser(decoded);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => { decodeAndSet(token); }, [token, decodeAndSet]);

  useEffect(() => {
    if (!user) return;
    const timeout = user.exp * 1000 - Date.now();
    if (timeout <= 0) { logout(); return; }
    const timer = setTimeout(logout, timeout);
    return () => clearTimeout(timer);
  }, [user]);

  const login = (t: string) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      token, user, isAuthenticated: !!user,
      login, logout,
      role: user?.role ?? null,
      tenantId: user?.tid ?? null,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
