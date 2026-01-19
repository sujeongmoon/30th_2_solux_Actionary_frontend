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
  const { setToken } = useAuth();

   /* 로그인 */
  const login = async (body: LoginRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      //setErrorMessage(null);

      const response = await loginApi(body);

      //삭제 const accessToken = response.data.accessToken
      const { accessToken, refreshToken, memberId, nickname, profileImageUrl } = response.data;
      
      setAuth({
        token: accessToken,
        refreshToken,
        user: { memberId, nickname, profileImageUrl },
      });

      navigate("/");
      return response;
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message ?? "로그인 오류가 발생했습니다.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


     /* 로그인 시 토큰 저장 */ 
      /* localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      setToken(accessToken);
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