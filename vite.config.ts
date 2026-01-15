import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://13.209.205.33:8080', // 실제 백엔드 서버 주소
        changeOrigin: true,
        secure: false, // https가 아니라면 false
      },
    },
  },
});