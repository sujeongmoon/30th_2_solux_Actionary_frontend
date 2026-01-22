import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ws': {
        target: 'actionary.site', 
        changeOrigin: true,
        ws: true
      },
      '/api': {
        target: 'actionary.site',
        changeOrigin: true,
      }
    }
  },
});
