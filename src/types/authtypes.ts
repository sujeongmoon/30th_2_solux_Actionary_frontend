export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface AuthResponseData {
  memberId: string;
  nickname: string;
  profileImageUrl: string;
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
}