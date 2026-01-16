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
    
    // 로그 1: 에러가 발생하면 무조건 상태 코드를 찍어봅니다.
    console.log("에러 발생! 상태코드:", error.response?.status);

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log(" 401 감지! 재발급 로직 진입");
      originalRequest._retry = true;

      try {
        console.log("refresh API 호출 시도...");
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        console.log("refresh 성공 응답:", refreshResponse.data);
        const newAccessToken = refreshResponse.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError: any) {
        //  로그 2: 재발급 실패 이유 확인
        console.error("refresh 실패 이유:", refreshError.response?.data || refreshError.message);
        
        authLogout();
        // localStorage.clear(); // 필요시 추가
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
    
  }
);
export default api;