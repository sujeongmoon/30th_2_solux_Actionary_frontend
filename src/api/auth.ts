import api from "axios";
import  type { LoginRequest, AuthResponse } from "../types/authtypes";

export const loginApi = async (body: LoginRequest) : Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", body);
  return response.data;
}

