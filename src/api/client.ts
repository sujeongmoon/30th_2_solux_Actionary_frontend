import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/* ===================== Request Interceptor ===================== */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ===================== Response Interceptor ===================== */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const url: string = originalRequest?.url ?? "";

    /**
     * [핵심] "비공개 스터디 비번 확인/입장" 요청에서 401은
     * 토큰 만료가 아니라 "비번 틀림"일 수 있음.
     * -> 절대 refresh/redirect 하지 말고 그대로 컴포넌트로 넘김
     */
    const isStudyJoinPasswordFlow =
      url.includes("/studies/") &&
      (url.includes("/enter") ||
        url.includes("/join") ||
        url.includes("/participate") ||
        url.includes("/participating") ||
        url.includes("/private") ||
        url.includes("/password") ||
        url.includes("/access") ||
        url.includes("/verify"));

    if (status === 401 && isStudyJoinPasswordFlow) {
      return Promise.reject(error);
    }

    // 토큰 만료(401) 처리: refresh 시도
    if (
      status === 401 &&
      !originalRequest._retry &&
      !url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");


      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refresh: refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (!newAccessToken) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return Promise.reject(error);
        }

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;