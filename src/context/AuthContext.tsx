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
  forceUpdate: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const [user, setUser] = useState<User | null>(null);
  //const isLoggedIn = useMemo(() => !!token, [token]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [, setUpdateFlag] = useState<boolean>(false);

  const forceUpdate = () => setUpdateFlag(prev => !prev);

  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("accessToken");
      setIsLoggedIn(false);
      setUser(null);
    }
    forceUpdate();
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
      setIsLoggedIn(false);
      forceUpdate();
    };
    window.addEventListener("force-logout", logoutHandler);
    return () => window.removeEventListener("force-logout", logoutHandler);
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    forceUpdate();
  };

  const value = useMemo(() => ({ isLoggedIn, token, user, setUser, setToken, logout, forceUpdate }), [isLoggedIn, token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}