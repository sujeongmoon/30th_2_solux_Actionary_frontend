import { createContext, useContext, useEffect, useMemo, useState } from "react";

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