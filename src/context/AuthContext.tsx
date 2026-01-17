import { createContext, useContext, useEffect, useMemo, useState } from "react";

let externalLogout: (() => void) | null = null;

type AuthContextValue = {
  isLoggedIn: boolean;
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const isLoggedIn = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else localStorage.removeItem("accessToken");
  }, [token]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem("accessToken");
  };

  useEffect(() => {
    externalLogout = logout;
  }, []);

  const value = useMemo(() => ({ isLoggedIn, token, setToken, logout }), [isLoggedIn, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const authLogout = () => {
  externalLogout?.();
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}