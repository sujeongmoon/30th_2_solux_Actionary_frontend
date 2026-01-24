import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = {
  profileImageUrl: string | null;
};

type AuthContextValue = {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  setToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const [user, setUser] = useState<User | null>(null);
  const isLoggedIn = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {localStorage.removeItem("accessToken");}
  }, [token]);

    /*useEffect(() => {
    const handler = () => {
      setToken(localStorage.getItem("accessToken"));
    };
    window.addEventListener("token-refreshed", handler);
    return () => window.removeEventListener("token-refreshed", handler);
  }, []);*/
  

  useEffect(() => {
    const logoutHandler = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("force-logout", logoutHandler);
    return () => window.removeEventListener("force-logout", logoutHandler);
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refresh");
  };

  const value = useMemo(() => ({ isLoggedIn, token, user, setUser, setToken, logout }), [isLoggedIn, token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}