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
      const accessToken = response.data.accessToken