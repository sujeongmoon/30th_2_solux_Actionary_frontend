import { useState } from "react";
import { loginApi } from "../api/auth";
import type { LoginRequest, AuthResponseData } from "../types/authtypes";
import axios from "axios";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = async (body: LoginRequest): Promise<AuthResponseData> => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await loginApi(body);

      if (!response.success) throw new Error(response.message);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "로그인 오류가 발생했습니다.");
      } else {
        setErrorMessage("알 수 없는 오류가 발생했습니다.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, errorMessage };
};