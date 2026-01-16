import axios from "axios";
import { authLogout } from "../context/AuthContext";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

{/* 리퀘스트 인터셉터 영역입니다 */}
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

{/* 리스폰스 인터셉터 영역입니다 */}
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    //accessToken 만료 (401) + 재시도 안 한 요청
    if (
      error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/refresh")) {
      originalRequest._retry = true;

      try {
        //const refreshToken = localStorage.getItem("refreshToken");
        /*(삭제?)
        if (!refreshToken) {
          throw new Error("refresh token 없음");
        }
        */
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true}
        );
        const newAccessToken = refreshResponse.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("세션 만료: 로그아웃 처리합니다.");
        // refresh 실패 시 완전 로그아웃
        localStorage.removeItem("accessToken");
        // (삭제?)localStorage.removeItem("refreshToken");
        authLogout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
      return Promise.reject(error); 
    
  }
);
export default api;