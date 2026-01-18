import api from "../api/client"
import  type { LoginRequest, AuthResponse } from "../types/authtypes";

/* 로그인 */
export const loginApi = async (body: LoginRequest) : Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", body);
  return response.data;
}; 

/* refresh 응답 타입 */
export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

/* 토큰 재발급 
export const refreshTokenApi = (refresh: string) => {
  return api.post<RefreshResponse>("/auth/refresh", { refresh });
}; */

/* ==== 회원가입 ====*/
/* 회원가입 타입 */
export interface SignupRequest {
  profile_image_url?: string;
  loginId: string;
  password: string;
  phoneNumber: string;
  email: string;
  name: string;
  birthday: string;
}

/* 회원가입 응답 타입 */
export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    member_id: number;
    loginId: string;
    nickname: string;
  };
}

/* 회원가입 */
export const signup = async (
  body: FormData
): Promise<SignupResponse> => {
  const response = await api.post<SignupResponse>(
    "/auth/signup", body,
    { headers: { "Content-Type": "multipart/form-data"},
  }
  );
  return response.data
};
