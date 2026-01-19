import { createContext, useContext, useEffect, useMemo, useState } from "react";


//추가
type AuthUser = {
  memberId: number | null;
  nickname: string;
  profileImageUrl?: string;
};


type AuthContextValue = {
  isLoggedIn: boolean;
  token: string | null;
  user: AuthUser;//추가
  setAuth: (payload: { token: string; refreshToken?: string; user: AuthUser }) => void; //추가
  setToken: (t: string | null) => void;
  logout: () => void;
};

//추가
const normalize = (v: any) => {
  const s = String(v ?? "").trim();
  const lower = s.toLowerCase();
  if (!s || lower === "undefined" || lower === "null") return "";
  return s;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  //추가
  const [user, setUser] = useState<AuthUser>(() => ({
    memberId: (() => {
      const v = localStorage.getItem("memberId");
      return v ? Number(v) : null;
    })(),
    nickname: normalize(localStorage.getItem("nickname")),
    profileImageUrl: normalize(localStorage.getItem("profileImageUrl")) || undefined,
  }));

  const isLoggedIn = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else localStorage.removeItem("accessToken");
  }, [token]);
//추가
  const setAuth: AuthContextValue["setAuth"] = ({ token, refreshToken, user }) => {
    setToken(token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    const nextUser: AuthUser = {
      memberId: user.memberId ?? null,
      nickname: normalize(user.nickname),
      profileImageUrl: normalize(user.profileImageUrl) || undefined,
    };
    setUser(nextUser);
    if (nextUser.memberId != null) localStorage.setItem("memberId", String(nextUser.memberId));
    else localStorage.removeItem("memberId");

    localStorage.setItem("nickname", nextUser.nickname);
    if (nextUser.profileImageUrl) localStorage.setItem("profileImageUrl", nextUser.profileImageUrl);
    else localStorage.removeItem("profileImageUrl");
  };

  


  const logout = () => {
    setToken(null);
    //추가
    setUser({ memberId: null, nickname: "", profileImageUrl: undefined });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    //추가
    localStorage.removeItem("memberId");
    localStorage.removeItem("nickname");
    localStorage.removeItem("profileImageUrl");
  };

  const value = useMemo(() => ({ isLoggedIn, token, user, setAuth, setToken, logout }), [isLoggedIn, token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}