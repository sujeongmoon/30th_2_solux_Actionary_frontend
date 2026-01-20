import axios from "axios";


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
      error.response?.status === 401 && 
      !(originalRequest as any)._retry && 
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      (originalRequest as any)._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          "/api/auth/refresh",
          { refresh: refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }      
    }
      return Promise.reject(error); 
  }
);
export default api;