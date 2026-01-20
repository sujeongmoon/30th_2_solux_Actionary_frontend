import axios from "axios";

// [수정] 프록시("/api") 대신 환경변수에 있는 진짜 주소(http://13.209...)를 사용합니다.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL: BASE_URL, 
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

    // accessToken 만료 (401) + 재시도 안 한 요청
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // [참고] window.location 사용 시 무한 리다이렉트 주의 필요
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          // [수정] 리프레시 요청도 BASE_URL을 사용해 확실하게 보냅니다.
          `${BASE_URL}/auth/refresh`,
          { refresh: refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }      
    }
    return Promise.reject(error); 
  }
);

export default api;