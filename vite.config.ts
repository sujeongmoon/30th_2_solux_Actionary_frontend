import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis", // ✅ sockjs-client가 찾는 global을 globalThis로 매핑
  },
});