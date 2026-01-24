import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue: {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}[] = [];

/* ===================== Request Interceptor ===================== */
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ===================== Response Interceptor ===================== */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;
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

    /* refresh 대상 아닌 경우 컷 */
    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (url.includes("/auth/refresh")) {
      forceLogout();
      return Promise.reject(error);
    }

    /* refresh 진행 중이라면 큐에 대기 */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    /* refresh 시작 */
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refresh");
    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    try {
      const response = await refreshApi.post("/auth/refresh", {
        refresh: refreshToken,
      });

      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = response.data?.data || {};

      if (!newAccessToken) {
        throw new Error ("No access token");
      }

      /* 토큰 저장 */
      localStorage.setItem("accessToken", newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem("refresh", newRefreshToken);
      }

      /* 이후 모든 요청에 새 토큰 적용 */
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      /* 대기 중인 요청들 처리 */
      refreshQueue.forEach((prom) => prom.resolve(newAccessToken));
      refreshQueue = [];

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      refreshQueue.forEach((prom) => prom.reject(refreshError));
      refreshQueue = [];
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

function forceLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refresh");
  window.dispatchEvent(new Event("force-logout"));
}

export default api;