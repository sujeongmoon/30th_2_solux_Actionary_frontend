import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 외부 접속 허용
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://13.209.205.33:8080/', // EC2 내부 도커 백엔드 주소
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
