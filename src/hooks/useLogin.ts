import { useState } from "react";
import { loginApi } from "../api/auth";
import type { LoginRequest } from "../types/authtypes";
import type { AuthResponse } from "../types/authtypes";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();

   /* 로그인 */
  const login = async (body: LoginRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await loginApi(body);
      //const accessToken = response.data.accessToken
      const { accessToken, refreshToken, profileImageUrl } = response.data;

     /* 로그인 시 토큰 저장 */ 
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setToken(accessToken);
      setUser({ profileImageUrl: profileImageUrl ?? null });
      navigate("/");

      return response;

    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ?? "로그인 오류가 발생했습니다."
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /* 로그아웃 
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } */
      

  return { login, isLoading, errorMessage }; 
};